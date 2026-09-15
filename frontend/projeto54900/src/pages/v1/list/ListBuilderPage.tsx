// Construtor — o usuário escolhe tabelas (todas vindas da API de introspecção
// do banco, igual ao FormBuilderPage) e cada tabela vira um card com um
// subcard MANAGER (campos de list_manager) e duas coleções IRMÃS: list_columns
// e list_actions — sem aninhamento entre si (diferente do form_manager ->
// form_groups -> form_rows -> form_fields, que é uma cadeia de 4 níveis).
//
// Campos: renderizados por <FormGrid> a partir de um FormGridSchema. Nenhum
// <input>/<select>/<textarea> escrito à mão — ver
// src/markdown/geral/README_render_via_formgrid.md.
//
// Fonte dos dados — sem lista estática:
//   - tabelas : dbSchema.tables()        -> GET api/v1/db-schema/tables
//   - colunas : dbSchema.columns(tabela) -> GET api/v1/db-schema/columns/{tabela}
//              (alimenta o select "Colunas (auto)" do manager — cada escolha
//              vira um list_columns.field_key pré-preenchido)
//   - perfis  : o campo select "Grupo de perfil"/"Roles" carrega via `src`
//              -> GET {apiBaseUrl}/v1/user-roles/get-no-pagination
//
// Persistência por nó (Salvar no modal), igual ao FormBuilderPage: create
// quando o nó ainda não tem dbId, update quando tem; um filho só pode ser
// salvo depois do manager (gating do [+] e do select "Colunas (auto)").
// list_columns/list_actions JSON estáticos (concat_json, sort_concat_json,
// extra_data_json, business_rule_json, limit_options_json) ficam como
// <textarea> de JSON cru por enquanto — editor estruturado é etapa à parte,
// igual ao débito já registrado para form_fields (ver README_form_builder.md).
//
// Modo edição — /v1/list-constructor/update/:id: hidrata a árvore de um
// registro existente. Diferente do form (que precisa da view_form_manager
// pra achatar 4 níveis), aqui list_columns/list_actions já são consultáveis
// direto por list_manager_id — GET list-manager/get/{id} + 2x find bastam,
// sem view. Nesse modo o seletor de tabelas do topo some (o registro já
// existe); a origem das colunas vem de list_manager.table_name (persistido,
// validado contra o schema no Processor) via um <select> dentro do próprio
// modal do manager — editável em qualquer modo, diferente do form (lá é
// gravado só na criação). tabelaDoEndpoint() vira só o fallback pra
// registros antigos, gravados antes desse campo existir.

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import FormModal from '@/pages/v1/form/FormModal';
import { ListTree, ListTreeNode } from './ListBuilderTree';
import {
  dbSchema,
  listManagerTable,
  listColumnsTable,
  listActionsTable,
} from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';
import { useToast } from '@/hooks/useToast';
import { slugify } from '@/utils/slug';
import { parseStringList, toStringList } from '@/utils/jsonList';
import { paths } from '@/routes/paths';
import { env } from '@/config/env';
import { KNOWN_CELL_FORMATS } from '@/utils/listConstructor';
import {
  type ActionLocal,
  type ColumnLocal,
  type ColunaInfo,
  type ColunasState,
  type ManagerLocal,
  type ManagerStatus,
  type TabelaInfo,
  actionFromRow,
  actionInicial,
  actionPayload,
  columnFromRow,
  columnInicial,
  columnPayload,
  colunasJaUsadas,
  managerFromRow,
  managerInicial,
  managerPayload,
  tabelaDoEndpoint,
  toColuna,
  toTabela,
} from './listBuilder.model';

type ManagerPatch = (tabela: string, patch: Partial<ManagerLocal>) => void;
type ColumnPatch = (tabela: string, id: string, patch: Partial<ColumnLocal>) => void;
type ActionPatch = (tabela: string, id: string, patch: Partial<ActionLocal>) => void;

// Nó cujo formulário está aberto no <FormModal> — um por vez.
type ModalAlvo =
  | { kind: 'manager'; tabela: string }
  | { kind: 'column'; tabela: string; columnId: string }
  | { kind: 'action'; tabela: string; actionId: string };

const STATUS_OPCOES = [
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const ORDER_OPCOES = [
  { value: 'asc', label: 'asc' },
  { value: 'desc', label: 'desc' },
];

const HTTP_OPCOES = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
  value: m,
  label: m,
}));

const ACTION_TYPE_OPCOES = [
  { value: 'link', label: 'link — abre uma URL (ex.: "Ver detalhes", "Editar")' },
  { value: 'api_call', label: 'api_call — chama a API direto, sem sair da tela (ex.: "Excluir", "Aprovar")' },
];

// Rótulo amigável por format — a lista de VALORES vem de KNOWN_CELL_FORMATS
// (utils/listConstructor.tsx), fonte única; aqui só troca o texto exibido.
const FORMAT_LABEL: Record<string, string> = {
  text: 'text — texto simples (padrão)',
  code: 'code — <code>',
  'status-badge': 'status-badge — badge colorido',
};
const FORMAT_OPCOES = KNOWN_CELL_FORMATS.map((f) => ({
  value: f,
  label: FORMAT_LABEL[f] ?? f,
}));

// Lista curada de classes Bootstrap úteis num <td> — não é "toda classe do
// Bootstrap" (inviável, são milhares de combinações), só as que fazem
// sentido numa célula de tabela. cell_class aceita mais de uma (grava
// separado por espaço, igual a um className comum) — MAS alinhamento é
// mutuamente exclusivo (text-start/center/end mexem na mesma propriedade
// CSS, text-align; marcar duas ao mesmo tempo não tem efeito visual
// previsível). Por isso vira um grupo à parte, select único — o resto
// continua multi-select (cada um cuida de uma propriedade CSS diferente,
// então combinam sem conflito).
const CELL_ALIGN_VALUES = new Set(['text-start', 'text-center', 'text-end']);
const CELL_ALIGN_OPCOES = [
  { value: '', label: '(nenhum)' },
  { value: 'text-start', label: 'text-start' },
  { value: 'text-center', label: 'text-center' },
  { value: 'text-end', label: 'text-end' },
];
const CELL_CLASS_OPCOES = [
  'text-nowrap', 'text-truncate', 'text-break',
  'text-muted', 'text-body-secondary',
  'fw-bold', 'fw-semibold', 'fw-normal',
  'small', 'fst-italic',
].map((c) => ({ value: c, label: c }));

const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;

/** Sufixo de status de persistência no `name` do nó da árvore. */
const sufixoDbId = (dbId: number | null | undefined): string =>
  dbId ? ` · #${dbId}` : ' · não salvo';

// ─── Schema do subcard MANAGER (list_manager) ───────────────────────────────

function managerSchema(
  tabela: string,
  m: ManagerLocal,
  patch: ManagerPatch,
  colunasInfo: ColunaInfo[],
  colunasUsadas: string[],
  onAddColunas: (values: string[]) => void,
  tabelasDisponiveis: TabelaInfo[],
  onChangeTabela: (value: string) => void,
): FormGridSchema {
  const tabelaOpcoes = [
    { value: '', label: '(nenhuma — usa o palpite do slug/endpoint)' },
    ...tabelasDisponiveis.map((t) => ({
      value: t.name,
      label: t.type === 'view' ? `${t.name} (view)` : t.name,
    })),
  ];
  return {
    rows: [
      {
        fields: [
          {
            col: 12,
            label: 'Título',
            name: 'title',
            required: true,
            maxLength: 255,
            placeholder: 'Nome exibido da listagem',
            value: m.title,
            onChange: (e) =>
              patch(
                tabela,
                m.slugAuto
                  ? { title: e.target.value, slug: slugify(e.target.value) }
                  : { title: e.target.value },
              ),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'Grupo de perfil',
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: parseStringList(m.roles),
            onChangeMultiple: (values) => patch(tabela, { roles: toStringList(values) }),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Slug',
            name: 'slug',
            required: true,
            maxLength: 255,
            placeholder: 'identificador-da-listagem',
            value: m.slug,
            onChange: (e) => patch(tabela, { slug: e.target.value, slugAuto: false }),
          },
          {
            type: 'select',
            col: 6,
            label: 'Status',
            required: true,
            options: STATUS_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: m.status,
            onChange: (value) => patch(tabela, { status: value as ManagerStatus }),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'api_get_endpoint',
            name: 'api_get_endpoint',
            maxLength: 255,
            placeholder: '/api/v1/.../get-all',
            value: m.apiGetEndpoint,
            onChange: (e) => patch(tabela, { apiGetEndpoint: e.target.value }),
          },
          {
            col: 6,
            label: 'api_search_endpoint',
            name: 'api_search_endpoint',
            maxLength: 255,
            placeholder: '/api/v1/.../search',
            value: m.apiSearchEndpoint,
            onChange: (e) => patch(tabela, { apiSearchEndpoint: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            col: 4,
            label: 'default_sort',
            name: 'default_sort',
            maxLength: 255,
            value: m.defaultSort,
            onChange: (e) => patch(tabela, { defaultSort: e.target.value }),
          },
          {
            type: 'select',
            col: 4,
            label: 'default_order',
            options: ORDER_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: m.defaultOrder,
            onChange: (value) => patch(tabela, { defaultOrder: value as 'asc' | 'desc' }),
          },
          {
            col: 4,
            label: 'default_limit',
            name: 'default_limit',
            inputMode: 'numeric',
            value: String(m.defaultLimit),
            onChange: (e) =>
              patch(tabela, { defaultLimit: Number.parseInt(e.target.value, 10) || 20 }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'limit_options_json',
            rows: 2,
            placeholder: '[10,20,50,100]',
            value: m.limitOptionsJson,
            onChange: (e) => patch(tabela, { limitOptionsJson: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'Descrição',
            rows: 2,
            showCounter: true,
            value: m.description,
            onChange: (e) => patch(tabela, { description: e.target.value }),
          },
        ],
      },
      {
        sectionTitle: 'Colunas (auto) — gera list_columns a partir da tabela',
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'Tabela/view de origem',
            options: tabelaOpcoes,
            valueKey: 'value',
            labelKey: 'label',
            value: m.tableName,
            onChange: onChangeTabela,
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: `Colunas de ${m.tableName || tabela}`,
            multiple: true,
            rows: 10,
            placeholder: 'Filtrar colunas...',
            // Só depois que o manager existe no banco (list_manager_id) faz
            // sentido escolher colunas — cada uma vira um list_columns vinculado.
            disabled: !m.dbId,
            valueKey: 'name',
            labelKey: 'name',
            options: colunasInfo.map((c) => ({ name: c.name })),
            disabledValues: colunasUsadas,
            values: [],
            onChangeMultiple: onAddColunas,
          },
        ],
      },
    ],
  };
}

// ─── Schema do subcard COLUNA (list_columns) ────────────────────────────────

function columnSchema(
  tabela: string,
  c: ColumnLocal,
  patch: ColumnPatch,
  colunasInfo: ColunaInfo[],
): FormGridSchema {
  // field_key / sort_key: mesma fonte (colunas reais da tabela), com opção em
  // branco — sort_key em branco = NULL (a API usa field_key como default).
  const colunaOpcoes = [
    { value: '', label: '(nenhuma)' },
    ...colunasInfo.map((info) => ({ value: info.name, label: info.name })),
  ];

  // cell_class guarda tudo junto (string com espaço), mas a UI separa em 2
  // grupos: alinhamento (mutuamente exclusivo — 1 só) e o resto (multi).
  const cellClassAtual = c.cellClass.split(' ').filter(Boolean);
  const cellAlign = cellClassAtual.find((cl) => CELL_ALIGN_VALUES.has(cl)) ?? '';
  const cellResto = cellClassAtual.filter((cl) => !CELL_ALIGN_VALUES.has(cl));
  const setCellClass = (align: string, resto: string[]) =>
    patch(tabela, c.id, { cellClass: [align, ...resto].filter(Boolean).join(' ') });

  return {
    rows: [
      {
        fields: [
          {
            col: 6,
            label: 'Label',
            name: 'label',
            required: true,
            maxLength: 255,
            placeholder: 'Cabeçalho exibido',
            value: c.label,
            onChange: (e) => patch(tabela, c.id, { label: e.target.value }),
          },
          {
            col: 6,
            label: 'sort_order',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(c.sortOrder),
            onChange: (e) =>
              patch(tabela, c.id, { sortOrder: Number.parseInt(e.target.value, 10) || 0 }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 6,
            label: 'field_key',
            options: colunaOpcoes,
            valueKey: 'value',
            labelKey: 'label',
            value: c.fieldKey,
            onChange: (value) => patch(tabela, c.id, { fieldKey: value }),
          },
          {
            type: 'select',
            col: 6,
            label: 'sort_key',
            options: colunaOpcoes,
            valueKey: 'value',
            labelKey: 'label',
            value: c.sortKey,
            onChange: (value) => patch(tabela, c.id, { sortKey: value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'concat_json — concatenar colunas/conteúdo na célula',
            rows: 2,
            placeholder: '[{"type":"field","key":"nome"},{"type":"literal","value":" - "}]',
            value: c.concatJson,
            onChange: (e) => patch(tabela, c.id, { concatJson: e.target.value }),
          },
        ],
      },
      {
        // As 3 listas lado a lado, mesma altura (~10 itens, .formgrid-fixed-list
        // em styles/_custom.scss — Bootstrap não tem utilitário pra isso).
        // radio pra escolha única (format / alinhamento), checkbox pra múltipla
        // (outras classes) — mais visual/operacional que <select> fechado.
        fields: [
          {
            type: 'radio',
            col: 4,
            label: 'format',
            name: `format-${c.id}`,
            className: 'formgrid-fixed-list border rounded p-2',
            options: FORMAT_OPCOES.map((o) => ({
              id: `format-${c.id}-${o.value}`,
              value: o.value,
              label: o.label,
            })),
            value: c.format,
            onChange: (value) => patch(tabela, c.id, { format: value }),
          },
          {
            type: 'radio',
            col: 4,
            label: 'cell_class — alinhamento',
            name: `align-${c.id}`,
            className: 'formgrid-fixed-list border rounded p-2',
            options: CELL_ALIGN_OPCOES.map((o) => ({
              id: `align-${c.id}-${o.value || 'none'}`,
              value: o.value,
              label: o.label,
            })),
            value: cellAlign,
            onChange: (value) => setCellClass(value, cellResto),
          },
          {
            type: 'checkbox',
            col: 4,
            label: 'cell_class — outras classes',
            name: `resto-${c.id}`,
            className: 'formgrid-fixed-list border rounded p-2',
            options: CELL_CLASS_OPCOES.map((o) => ({
              id: `resto-${c.id}-${o.value}`,
              value: o.value,
              label: o.label,
            })),
            value: cellResto,
            onChange: (values) => setCellClass(cellAlign, values),
          },
        ],
      },
      {
        fields: [
          {
            col: 3,
            label: 'fallback',
            name: 'fallback',
            maxLength: 50,
            value: c.fallback,
            onChange: (e) => patch(tabela, c.id, { fallback: e.target.value }),
          },
          {
            type: 'checkbox',
            col: 4,
            // Rótulo "invisível" (nbsp) só pra reservar a mesma altura do
            // label de `fallback` — sem isso o checkbox sobe (sem label de
            // grupo) e desalinha verticalmente da linha.
            label: ' ',
            name: `sortable-${c.id}`,
            inline: true,
            options: [{ id: `sortable-${c.id}`, value: '1', label: 'Ordenável (sortable)' }],
            value: c.sortable ? ['1'] : [],
            onChange: (values) => patch(tabela, c.id, { sortable: values.includes('1') }),
          },
          {
            type: 'checkbox',
            col: 4,
            label: ' ',
            name: `visible-${c.id}`,
            inline: true,
            options: [{ id: `visible-${c.id}`, value: '1', label: 'Visível' }],
            value: c.visible ? ['1'] : [],
            onChange: (values) => patch(tabela, c.id, { visible: values.includes('1') }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'sort_concat_json — ordenação composta (mais de uma coluna)',
            rows: 2,
            value: c.sortConcatJson,
            onChange: (e) => patch(tabela, c.id, { sortConcatJson: e.target.value }),
          },
        ],
      },
    ],
  };
}

// ─── Schema do subcard AÇÃO (list_actions) ──────────────────────────────────

// list_actions — modal enxuto: só o que é FUNCIONAL de verdade hoje.
// data_action/target/extra_data_json saíram daqui (write-only, ninguém lê de
// volta — ver README_list_constructor.md, "list_actions simplificado") mas
// continuam existindo no banco: se um dia ganharem consumidor, voltam pro
// modal. icon é <IconSelect> fora do FormGrid (renderModal), igual ao ícone
// de form_groups no FormBuilderPage.
function actionSchema(tabela: string, a: ActionLocal, patch: ActionPatch): FormGridSchema {
  const ehLink = a.actionType === 'link';

  return {
    rows: [
      {
        fields: [
          {
            col: 8,
            label: 'Label',
            name: 'label',
            required: true,
            maxLength: 255,
            placeholder: 'Editar, Ver detalhes, Excluir...',
            value: a.label,
            onChange: (e) => patch(tabela, a.id, { label: e.target.value }),
          },
          {
            col: 4,
            label: 'sort_order',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(a.sortOrder),
            onChange: (e) =>
              patch(tabela, a.id, { sortOrder: Number.parseInt(e.target.value, 10) || 0 }),
          },
        ],
      },
      {
        sectionTitle: 'Como a ação executa',
        fields: [
          {
            type: 'radio',
            col: 12,
            label: 'action_type',
            required: true,
            name: `action_type-${a.id}`,
            options: ACTION_TYPE_OPCOES.map((o) => ({
              id: `action_type-${a.id}-${o.value}`,
              value: o.value,
              label: o.label,
            })),
            value: a.actionType,
            onChange: (value) => patch(tabela, a.id, { actionType: value as 'link' | 'api_call' }),
          },
        ],
      },
      ehLink
        ? {
          fields: [
            {
              col: 12,
              label: 'href_template — URL pra onde o link leva',
              name: 'href_template',
              maxLength: 255,
              placeholder: 'ex.: /v1/user-manager/update/{id}  ({id}/{slug}... viram o valor real da linha)',
              value: a.hrefTemplate,
              onChange: (e) => patch(tabela, a.id, { hrefTemplate: e.target.value }),
            },
          ],
        }
        : {
          fields: [
            {
              col: 8,
              label: 'api_endpoint — URL que é chamada direto',
              name: 'api_endpoint',
              maxLength: 255,
              placeholder: 'ex.: /api/v1/user-manager/delete-soft/{id}',
              value: a.apiEndpoint,
              onChange: (e) => patch(tabela, a.id, { apiEndpoint: e.target.value }),
            },
            {
              type: 'select',
              col: 4,
              label: 'http_method',
              options: HTTP_OPCOES,
              valueKey: 'value',
              labelKey: 'label',
              value: a.httpMethod,
              onChange: (value) => patch(tabela, a.id, { httpMethod: value }),
            },
          ],
        },
      {
        sectionTitle: 'Confirmação antes de executar (opcional)',
        fields: [
          {
            type: 'checkbox',
            col: 4,
            name: `confirm-${a.id}`,
            inline: true,
            options: [{ id: `confirm-${a.id}`, value: '1', label: 'Pedir confirmação' }],
            value: a.confirm ? ['1'] : [],
            onChange: (values) => patch(tabela, a.id, { confirm: values.includes('1') }),
          },
          {
            col: 8,
            label: 'confirm_message — texto do "Confirma?"',
            name: 'confirm_message',
            maxLength: 255,
            placeholder: 'ex.: Deseja realmente excluir este registro?',
            value: a.confirmMessage,
            onChange: (e) => patch(tabela, a.id, { confirmMessage: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: 'roles — perfis que veem este botão (vazio = todos)',
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: parseStringList(a.roles),
            onChangeMultiple: (values) => patch(tabela, a.id, { roles: toStringList(values) }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            col: 12,
            label: 'business_rule_json — só libera o botão se a linha bater com a condição',
            rows: 2,
            placeholder: 'ex.: {"field":"status","op":"eq","value":"Aprovada"} — libera só quando status da linha = Aprovada',
            value: a.businessRuleJson,
            onChange: (e) => patch(tabela, a.id, { businessRuleJson: e.target.value }),
          },
        ],
      },
    ],
  };
}

// ─── Página ──────────────────────────────────────────────────────────────

export default function ListBuilderPage() {
  // Modo edição: /v1/list-constructor/update/:id. Sem :id -> modo criação (padrão).
  const { id: routeId } = useParams();
  const recordId = routeId && /^\d+$/.test(routeId) ? Number(routeId) : null;
  const modoEdicao = recordId !== null;

  const [edicaoLoading, setEdicaoLoading] = useState(modoEdicao);
  const [edicaoErro, setEdicaoErro] = useState<string | null>(null);

  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<TabelaInfo[]>([]);
  const [tabelasLoading, setTabelasLoading] = useState(true);
  const [tabelasErro, setTabelasErro] = useState<string | null>(null);

  const [tabelas, setTabelas] = useState<string[]>([]);
  const [managers, setManagers] = useState<Record<string, ManagerLocal>>({});
  // Cache das colunas por tabela (2a API) — alimenta o select "Colunas (auto)".
  const [colunas, setColunas] = useState<Record<string, ColunasState>>({});
  const [columns, setColumns] = useState<Record<string, ColumnLocal[]>>({});
  const [actions, setActions] = useState<Record<string, ActionLocal[]>>({});

  const toast = useToast();
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  // 1a API — todas as tabelas do banco, sem paginação.
  useEffect(() => {
    const ctrl = new AbortController();
    setTabelasLoading(true);
    setTabelasErro(null);
    void dbSchema
      .tables({ signal: ctrl.signal })
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        setTabelasDisponiveis(rows.map(toTabela).filter((t) => t.name !== ''));
        setTabelasLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setTabelasErro(err instanceof ApiError ? err.message : 'Falha ao carregar as tabelas.');
        setTabelasLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, []);

  // Modo edição — hidrata manager + colunas + ações do registro existente.
  // Sem view: list_columns/list_actions já são consultáveis direto por
  // list_manager_id (2 find em paralelo), diferente do form.
  useEffect(() => {
    if (recordId === null) return;
    const ctrl = new AbortController();
    setEdicaoLoading(true);
    setEdicaoErro(null);
    void listManagerTable
      .get(recordId, { signal: ctrl.signal })
      .then(async (raw) => {
        const item = normalizeItem<Record<string, unknown>>(raw);
        if (!item) {
          setEdicaoErro(`Listagem #${recordId} não encontrada.`);
          setEdicaoLoading(false);
          return;
        }
        const m = managerFromRow(item);
        const chave = m.slug || `lista-${recordId}`;

        const [colsRaw, actsRaw] = await Promise.all([
          listColumnsTable.find(
            { list_manager_id: recordId },
            { sort: 'sort_order', order: 'ASC', limit: 100 },
            { signal: ctrl.signal },
          ),
          listActionsTable.find(
            { list_manager_id: recordId },
            { sort: 'sort_order', order: 'ASC', limit: 100 },
            { signal: ctrl.signal },
          ),
        ]);

        setTabelas([chave]);
        setManagers({ [chave]: m });
        setColumns({ [chave]: normalizeList<Record<string, unknown>>(colsRaw).rows.map(columnFromRow) });
        setActions({ [chave]: normalizeList<Record<string, unknown>>(actsRaw).rows.map(actionFromRow) });
        setEdicaoLoading(false);

        // table_name persistido é a fonte da verdade (ver managerFromRow); só
        // cai no heurístico do form builder (kebab-case da API -> snake_case
        // do banco) pra registros antigos, gravados antes desse campo existir.
        // Popula colunas[origem] — alimenta os selects de field_key/sort_key
        // (modal da coluna) e "Colunas (auto)" (modal do manager). Se o
        // palpite errar, os selects só ficam vazios (mesmo estado de antes),
        // sem quebrar nada — por isso não bloqueia edicaoLoading nem mostra erro.
        const origem = m.tableName || tabelaDoEndpoint(m.apiGetEndpoint, m.slug);
        if (!origem) return;
        setColunas((prev) => ({ ...prev, [origem]: { loading: true, error: null, items: [] } }));
        void dbSchema
          .columns(origem, { signal: ctrl.signal })
          .then((rawCols) => {
            const { rows: colRows } = normalizeList<Record<string, unknown>>(rawCols);
            setColunas((prev) => ({
              ...prev,
              [origem]: { loading: false, error: null, items: colRows.map(toColuna).filter((c) => c.name !== '') },
            }));
          })
          .catch(() => {
            // Palpite de tabela errado (404) ou outra falha — degrada em
            // silêncio para "sem opções", não é um erro que bloqueia a tela.
            setColunas((prev) => ({ ...prev, [origem]: { loading: false, error: null, items: [] } }));
          });
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setEdicaoErro(err instanceof ApiError ? err.message : 'Falha ao carregar a listagem.');
        setEdicaoLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, [recordId]);

  // 2a API — colunas de uma tabela; uma vez por tabela, com cache em estado.
  const carregarColunas = useCallback((tabela: string) => {
    let jaTem = false;
    setColunas((prev) => {
      if (prev[tabela]) {
        jaTem = true;
        return prev;
      }
      return { ...prev, [tabela]: { loading: true, error: null, items: [] } };
    });
    if (jaTem) return;

    void dbSchema
      .columns(tabela)
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        setColunas((prev) => ({
          ...prev,
          [tabela]: { loading: false, error: null, items: rows.map(toColuna).filter((c) => c.name !== '') },
        }));
      })
      .catch((err: unknown) => {
        setColunas((prev) => ({
          ...prev,
          [tabela]: {
            loading: false,
            error: err instanceof ApiError ? err.message : 'Falha ao carregar as colunas.',
            items: [],
          },
        }));
      });
  }, []);

  const handleTabelas = useCallback(
    (values: string[]) => {
      setTabelas(values);
      setManagers((prev) => {
        const next = { ...prev };
        values.forEach((t) => {
          if (!next[t]) next[t] = managerInicial(t);
        });
        return next;
      });
      values.forEach((t) => carregarColunas(t));
    },
    [carregarColunas],
  );

  const atualizarManager = useCallback<ManagerPatch>((tabela, patch) => {
    setManagers((prev) => ({
      ...prev,
      [tabela]: { ...(prev[tabela] ?? managerInicial()), ...patch },
    }));
  }, []);

  const adicionarColuna = useCallback((tabela: string) => {
    setColumns((prev) => {
      const atuais = prev[tabela] ?? [];
      return { ...prev, [tabela]: [...atuais, columnInicial(undefined, atuais.length)] };
    });
  }, []);

  const atualizarColuna = useCallback<ColumnPatch>((tabela, id, patch) => {
    setColumns((prev) => ({
      ...prev,
      [tabela]: (prev[tabela] ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  // Gera 1 list_columns por coluna real escolhida no select "Colunas (auto)"
  // do manager — mesma ideia de adicionarColunasLinha do form builder. As
  // colunas reais ficam em colunas[origem] (tableName do manager, não a
  // chave de UI — em modo edição a chave é o slug, não a tabela).
  const adicionarColunasAuto = useCallback((tabela: string, escolhidas: string[]) => {
    setColumns((prev) => {
      const atuais = prev[tabela] ?? [];
      const usadas = new Set(colunasJaUsadas(atuais));
      const origem = managers[tabela]?.tableName || tabela;
      const infos = colunas[origem]?.items ?? [];
      const novas = escolhidas
        .filter((nome) => !usadas.has(nome))
        .map((nome, i) => columnInicial(infos.find((c) => c.name === nome), atuais.length + i));
      return novas.length > 0 ? { ...prev, [tabela]: [...atuais, ...novas] } : prev;
    });
  }, [colunas, managers]);

  const removerColuna = useCallback(
    (tabela: string, id: string) => {
      const alvo = (columns[tabela] ?? []).find((c) => c.id === id);
      const limparLocal = () => {
        setColumns((prev) => ({
          ...prev,
          [tabela]: (prev[tabela] ?? []).filter((c) => c.id !== id),
        }));
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void listColumnsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('list_columns removido.');
        })
        .catch((err: unknown) => {
          toast.error(err instanceof ApiError ? err.message : 'Falha ao remover no banco.');
        });
    },
    [columns, toast],
  );

  const adicionarAcao = useCallback((tabela: string) => {
    setActions((prev) => {
      const atuais = prev[tabela] ?? [];
      return { ...prev, [tabela]: [...atuais, actionInicial(atuais.length)] };
    });
  }, []);

  const atualizarAcao = useCallback<ActionPatch>((tabela, id, patch) => {
    setActions((prev) => ({
      ...prev,
      [tabela]: (prev[tabela] ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removerAcao = useCallback(
    (tabela: string, id: string) => {
      const alvo = (actions[tabela] ?? []).find((a) => a.id === id);
      const limparLocal = () => {
        setActions((prev) => ({
          ...prev,
          [tabela]: (prev[tabela] ?? []).filter((a) => a.id !== id),
        }));
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void listActionsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('list_actions removido.');
        })
        .catch((err: unknown) => {
          toast.error(err instanceof ApiError ? err.message : 'Falha ao remover no banco.');
        });
    },
    [actions, toast],
  );

  // Nó cujo formulário está aberto no modal (null = nenhum).
  const [modal, setModal] = useState<ModalAlvo | null>(null);

  // Troca de nó no modal zera o estado de persistência.
  useEffect(() => {
    setSalvando(false);
    setErroSalvar(null);
  }, [modal]);

  // ─── Persistência por nó — Salvar no modal ────────────────────────────────

  const extrairId = (raw: unknown): number => {
    const rec = normalizeItem<Record<string, unknown>>(raw);
    const id = Number(rec?.id);
    if (!Number.isFinite(id) || id < 1) {
      throw new ApiError('A API não devolveu o id do registro.');
    }
    return id;
  };

  const executarSalvar = useCallback(
    async (fn: () => Promise<void>, okMsg: string) => {
      setSalvando(true);
      setErroSalvar(null);
      try {
        await fn();
        toast.success(okMsg);
        setModal(null);
      } catch (err) {
        setErroSalvar(err instanceof ApiError ? err.message : 'Falha ao salvar. Tente de novo.');
      } finally {
        setSalvando(false);
      }
    },
    [toast],
  );

  const salvarManager = (tabela: string) => {
    const m = managers[tabela];
    if (!m) return;
    void executarSalvar(async () => {
      const raw = m.dbId
        ? await listManagerTable.update(m.dbId, managerPayload(m))
        : await listManagerTable.create(managerPayload(m));
      atualizarManager(tabela, { dbId: extrairId(raw) });
    }, m.dbId ? 'list_manager atualizado.' : 'list_manager salvo.');
  };

  const salvarColuna = (tabela: string, columnId: string) => {
    const lmId = managers[tabela]?.dbId;
    const c = (columns[tabela] ?? []).find((x) => x.id === columnId);
    if (!c) return;
    if (!lmId) {
      setErroSalvar('Salve o list_manager antes da coluna.');
      return;
    }
    void executarSalvar(async () => {
      const raw = c.dbId
        ? await listColumnsTable.update(c.dbId, columnPayload(c, lmId))
        : await listColumnsTable.create(columnPayload(c, lmId));
      atualizarColuna(tabela, columnId, { dbId: extrairId(raw) });
    }, c.dbId ? 'list_columns atualizado.' : 'list_columns salvo.');
  };

  const salvarAcao = (tabela: string, actionId: string) => {
    const lmId = managers[tabela]?.dbId;
    const a = (actions[tabela] ?? []).find((x) => x.id === actionId);
    if (!a) return;
    if (!lmId) {
      setErroSalvar('Salve o list_manager antes da ação.');
      return;
    }
    void executarSalvar(async () => {
      const raw = a.dbId
        ? await listActionsTable.update(a.dbId, actionPayload(a, lmId))
        : await listActionsTable.create(actionPayload(a, lmId));
      atualizarAcao(tabela, actionId, { dbId: extrairId(raw) });
    }, a.dbId ? 'list_actions atualizado.' : 'list_actions salvo.');
  };

  // Card seletor de tabelas.
  const schema: FormGridSchema = {
    rows: [
      {
        fields: [
          {
            type: 'select',
            col: 12,
            id: 'tabelas',
            name: 'tabelas',
            multiple: true,
            rows: 10,
            placeholder: 'Filtrar tabelas...',
            valueKey: 'name',
            labelKey: 'name',
            options: tabelasDisponiveis.map((t) => ({ name: t.name })),
            onChangeMultiple: handleTabelas,
          },
        ],
      },
    ],
  };

  const fecharModal = () => {
    setModal(null);
    setErroSalvar(null);
  };

  const renderModal = () => {
    if (!modal) return null;

    if (modal.kind === 'manager') {
      const m = managers[modal.tabela] ?? managerInicial();
      const tabela = modal.tabela;
      const origem = m.tableName || tabela;
      const colunasInfo = colunas[origem]?.items ?? [];
      const usadas = colunasJaUsadas(columns[tabela] ?? []);
      const onChangeTabela = (value: string) => {
        atualizarManager(tabela, { tableName: value });
        if (value) carregarColunas(value);
      };
      return (
        <FormModal
          title={<><code>list_manager</code> · {tabela}</>}
          onClose={fecharModal}
          onSave={() => salvarManager(tabela)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid
            schema={managerSchema(
              tabela,
              m,
              atualizarManager,
              colunasInfo,
              usadas,
              (values) => adicionarColunasAuto(tabela, values),
              tabelasDisponiveis,
              onChangeTabela,
            )}
          />
        </FormModal>
      );
    }

    if (modal.kind === 'column') {
      const c = (columns[modal.tabela] ?? []).find((x) => x.id === modal.columnId);
      if (!c) return null;
      const tabela = modal.tabela;
      const origem = managers[tabela]?.tableName || tabela;
      return (
        <FormModal
          title={<><code>list_columns</code> · {tabela}</>}
          onClose={fecharModal}
          onSave={() => salvarColuna(tabela, c.id)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid schema={columnSchema(tabela, c, atualizarColuna, colunas[origem]?.items ?? [])} />
        </FormModal>
      );
    }

    const a = (actions[modal.tabela] ?? []).find((x) => x.id === modal.actionId);
    if (!a) return null;
    const tabela = modal.tabela;
    return (
      <FormModal
        title={<><code>list_actions</code> · {tabela}</>}
        onClose={fecharModal}
        onSave={() => salvarAcao(tabela, a.id)}
        saving={salvando}
        saveError={erroSalvar}
      >
        <FormGrid schema={actionSchema(tabela, a, atualizarAcao)} />
        <div className="row g-3">
          <div className="col-md-6 mb-1">
            <label className="form-label">Ícone</label>
            <IconSelect
              value={a.icon}
              onChange={(nome) => atualizarAcao(tabela, a.id, { icon: nome })}
            />
          </div>
        </div>
      </FormModal>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">
            Construtor de Listas — {modoEdicao ? `editando #${recordId}` : 'nova'}
          </h1>
          <p className="text-body-secondary mb-0">
            {modoEdicao ? (
              <>
                Continue preenchendo <code>list_columns</code>/<code>list_actions</code>{' '}
                desta listagem.
              </>
            ) : (
              <>
                Escolha uma ou mais tabelas; cada uma vira um card com{' '}
                <code>list_manager</code> (a listagem) e duas coleções irmãs:{' '}
                <code>list_columns</code> e <code>list_actions</code>.
              </>
            )}
          </p>
        </div>
        <Link className="btn btn-outline-secondary" to={paths.v1.list.list}>
          Voltar às listagens
        </Link>
      </div>

      {modoEdicao ? (
        edicaoLoading || edicaoErro ? (
          <div className="card shadow-sm">
            <div className="card-body p-3 p-sm-4">
              {edicaoLoading && <p className="text-muted small mb-0">Carregando listagem…</p>}
              {edicaoErro && <div className="alert alert-danger mt-2 mb-0 py-2 small">{edicaoErro}</div>}
            </div>
          </div>
        ) : !managers[tabelas[0] ?? '']?.tableName ? (
          <div className="alert alert-info py-2 small mb-3">
            &quot;Colunas (auto)&quot; ainda sem opções — edite o manager (
            <i className="bi bi-pencil-square" aria-hidden="true" />) e escolha a{' '}
            <span className="fw-semibold">Tabela/view de origem</span>, ou adicione colunas
            manualmente (<span className="fw-semibold">+ list_columns</span>).
          </div>
        ) : null
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-3 p-sm-4">
            {tabelasLoading ? (
              <p className="text-muted small mb-0">Carregando tabelas…</p>
            ) : (
              <FormGrid schema={schema} />
            )}
            {tabelasErro && <div className="alert alert-danger mt-3 mb-0 py-2 small">{tabelasErro}</div>}
          </div>
        </div>
      )}

      {(!modoEdicao || (!edicaoLoading && !edicaoErro)) && tabelas.map((tabela) => {
        const m = managers[tabela] ?? managerInicial();
        const cols = columns[tabela] ?? [];
        const acts = actions[tabela] ?? [];
        const managerId = `manager:${tabela}`;

        return (
          <div className="card shadow-sm mt-3" key={tabela}>
            <div className="card-header">
              <span className="fw-semibold text-nowrap">{tabela}</span>
            </div>
            <div className="card-body">
              {/* Hierarquia list_manager -> [list_columns, list_actions]: 2
                  coleções irmãs, ambas folha (só o manager expande). */}
              <ListTree>
                <ListTreeNode
                  id={managerId}
                  parents={[]}
                  level="manager"
                  name={`${m.slug || tabela}${sufixoDbId(m.dbId)}`}
                  count={cols.length + acts.length}
                  addActions={[
                    { label: 'list_columns', onAdd: () => adicionarColuna(tabela), disabled: !m.dbId },
                    { label: 'list_actions', onAdd: () => adicionarAcao(tabela), disabled: !m.dbId },
                  ]}
                  onEdit={() => setModal({ kind: 'manager', tabela })}
                >
                  {cols.length === 0 && acts.length === 0 ? (
                    <p className="text-body-secondary small fst-italic py-1 mb-0">
                      Sem colunas nem ações — use{' '}
                      <span className="fw-semibold">+ list_columns</span> /{' '}
                      <span className="fw-semibold">+ list_actions</span>, ou edite o manager
                      (✏️) e escolha em &quot;Colunas (auto)&quot;.
                    </p>
                  ) : null}

                  {cols.length > 0 ? (
                    <div className="small text-uppercase text-body-secondary fw-semibold mt-2 mb-1">
                      Colunas
                    </div>
                  ) : null}
                  {cols.map((c) => (
                    <ListTreeNode
                      key={c.id}
                      id={`column:${c.id}`}
                      parents={[managerId]}
                      level="column"
                      name={`${c.label || c.fieldKey || 'sem label'}${sufixoDbId(c.dbId)}`}
                      onEdit={() => setModal({ kind: 'column', tabela, columnId: c.id })}
                      onRemove={() => removerColuna(tabela, c.id)}
                    />
                  ))}

                  {acts.length > 0 ? (
                    <div className="small text-uppercase text-body-secondary fw-semibold mt-2 mb-1">
                      Ações
                    </div>
                  ) : null}
                  {acts.map((a) => (
                    <ListTreeNode
                      key={a.id}
                      id={`action:${a.id}`}
                      parents={[managerId]}
                      level="action"
                      name={`${a.label || 'sem label'}${sufixoDbId(a.dbId)}`}
                      onEdit={() => setModal({ kind: 'action', tabela, actionId: a.id })}
                      onRemove={() => removerAcao(tabela, a.id)}
                    />
                  ))}
                </ListTreeNode>
              </ListTree>
            </div>
          </div>
        );
      })}

      {renderModal()}
    </div>
  );
}
