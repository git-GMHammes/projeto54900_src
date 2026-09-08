// Construtor — o usuário escolhe tabelas (todas vindas da API de introspecção do
// banco) e cada tabela vira um card com um subcard FORMULÁRIO (campos de
// form_manager) e N subcards GRUPOS (campos de form_groups). Estado só local:
// nada é persistido ainda.
//
// Campos: renderizados por <FormGrid> a partir de um FormGridSchema. Nenhum
// <input>/<select>/<textarea> escrito à mão aqui — ver
// src/markdown/geral/README_render_via_formgrid.md.
//
// Fonte dos dados — sem lista estática:
//   - tabelas : dbSchema.tables()        -> GET api/v1/db-schema/tables
//   - colunas : dbSchema.columns(tabela) -> GET api/v1/db-schema/columns/{tabela}
//   - perfis  : o próprio campo select "Grupo de perfil" carrega via `src`
//               -> GET {apiBaseUrl}/v1/user-roles/get-no-pagination

import { useCallback, useEffect, useState } from 'react';
import FormGrid from '@/components/ui/FormGrid/Input';
import type {
  AnyFieldSchema,
  FormGridSchema,
  FormRowSchema,
} from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import { dbSchema } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';
import { slugify } from '@/utils/slug';
import { parseStringList, toStringList } from '@/utils/jsonList';
import { env } from '@/config/env';
import {
  type CampoLocal,
  type ColunaInfo,
  type ColunasState,
  type GrupoLocal,
  type ManagerLocal,
  type ManagerStatus,
  type RowLocal,
  type TabelaInfo,
  MAX_COLUNAS_POR_LINHA,
  adicionarColunas,
  campoInicial,
  grupoInicial,
  managerInicial,
  removerColuna,
  rowInicial,
  toColuna,
  toTabela,
} from './formBuilder.model';

type ManagerPatch = (tabela: string, patch: Partial<ManagerLocal>) => void;
type GrupoPatch = (tabela: string, id: string, patch: Partial<GrupoLocal>) => void;
type RowPatch = (grupoId: string, id: string, patch: Partial<RowLocal>) => void;
type CampoPatch = (
  linhaId: string,
  coluna: string,
  patch: Partial<CampoLocal>,
) => void;

const STATUS_OPCOES = [
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const HTTP_OPCOES = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
  value: m,
  label: m,
}));

const GUTTER_OPCOES = ['g-0', 'g-1', 'g-2', 'g-3', 'g-4', 'g-5'].map((g) => ({
  value: g,
  label: g,
}));

// Enum `field_type` do banco — ordem exata da migration 2026-09-06-012303.
const FIELD_TYPE_OPCOES = [
  'text', 'password', 'email', 'textarea', 'senha', 'select', 'radio',
  'checkbox', 'cpf', 'cnpj', 'phone', 'cep', 'data', 'hora', 'moeda',
  'pis', 'placa', 'titulo', 'cnh', 'processo', 'renavam', 'sei',
].map((t) => ({ value: t, label: t }));

const COL_OPCOES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const INPUT_MODE_OPCOES = [
  '', 'text', 'numeric', 'decimal', 'tel', 'email', 'url', 'search', 'none',
].map((v) => ({ value: v, label: v || '(nenhum)' }));

// Config específica de cada field_type, além dos blocos comuns (Estrutura,
// Estado/validação) — só o que o `<Tipo>FieldSchema` de
// `src/components/ui/FormGrid/<tipo>` declara como opção de produto. Tipos
// mascarados (`cpf`…`sei`) e `moeda` não acrescentam nada.
const CAMPOS_POR_TIPO: Record<string, string[]> = {
  text: ['datalist_json', 'no_numbers', 'no_letters', 'no_special_chars'],
  password: ['no_numbers', 'no_letters', 'no_special_chars'],
  senha: [
    'no_numbers', 'no_letters', 'no_special_chars',
    'strong_password', 'double_field', 'equal_fields',
  ],
  email: ['allowed_domains_json'],
  textarea: [
    'rows_qty', 'show_counter', 'no_numbers', 'no_letters', 'no_special_chars',
  ],
  select: [
    'sel_multiple', 'options_json',
    'sel_src', 'sel_value_key', 'sel_label_key', 'sel_label_template',
    'sel_max_visible', 'sel_rows', 'sel_auth_token',
    'sel_find_src', 'sel_find_column', 'sel_get_src',
  ],
  radio: ['options_json', 'inline'],
  checkbox: ['options_json', 'inline'],
  data: ['min_date', 'max_date'],
  hora: ['with_seconds'],
};

const USER_ROLES_SRC = `${env.apiBaseUrl}/v1/user-roles/get-no-pagination`;

// ─── Schema do subcard FORMULÁRIO (form_manager) ────────────────────────────

function managerSchema(
  tabela: string,
  m: ManagerLocal,
  patch: ManagerPatch,
): FormGridSchema {
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
            placeholder: 'Cabeçalho exibido no topo do formulário',
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
            required: true,
            multiple: true,
            src: USER_ROLES_SRC,
            valueKey: 'slug',
            labelKey: 'name',
            values: parseStringList(m.profile_group),
            onChangeMultiple: (values) =>
              patch(tabela, { profile_group: toStringList(values) }),
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
            placeholder: 'identificador-do-formulario',
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
            col: 12,
            label: 'Rota React',
            name: 'react_route',
            required: true,
            maxLength: 255,
            placeholder: '/v1/meu-form',
            value: m.react_route,
            onChange: (e) => patch(tabela, { react_route: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            col: 4,
            label: 'Endpoint de envio',
            name: 'submit_endpoint',
            required: true,
            maxLength: 255,
            placeholder: '/api/v1/...',
            value: m.submit_endpoint,
            onChange: (e) => patch(tabela, { submit_endpoint: e.target.value }),
          },
          {
            type: 'select',
            col: 4,
            label: 'Método HTTP',
            required: true,
            options: HTTP_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: m.http_method,
            onChange: (value) => patch(tabela, { http_method: value }),
          },
          {
            col: 4,
            label: 'Versão',
            name: 'version',
            required: true,
            inputMode: 'numeric',
            value: String(m.version),
            onChange: (e) =>
              patch(tabela, {
                version: Number.parseInt(e.target.value, 10) || 1,
              }),
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
    ],
  };
}

// ─── Schema do subcard GRUPOS (form_groups) — o ícone fica fora (IconSelect) ──

function grupoSchema(
  tabela: string,
  g: GrupoLocal,
  patch: GrupoPatch,
): FormGridSchema {
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
            placeholder: 'Nome do grupo',
            value: g.title,
            onChange: (e) =>
              patch(
                tabela,
                g.id,
                g.slugAuto
                  ? { title: e.target.value, slug: slugify(e.target.value) }
                  : { title: e.target.value },
              ),
          },
        ],
      },
      {
        fields: [
          {
            col: 6,
            label: 'Slug',
            name: 'slug',
            maxLength: 255,
            value: g.slug,
            onChange: (e) =>
              patch(tabela, g.id, { slug: e.target.value, slugAuto: false }),
          },
          {
            col: 6,
            label: 'Ordem',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(g.sort_order),
            onChange: (e) =>
              patch(tabela, g.id, {
                sort_order: Number.parseInt(e.target.value, 10) || 0,
              }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'checkbox',
            col: 12,
            name: `collapsed-${g.id}`,
            inline: true,
            options: [{ id: `collapsed-${g.id}`, value: '1', label: 'Recolhido' }],
            value: g.collapsed ? ['1'] : [],
            onChange: (values) =>
              patch(tabela, g.id, { collapsed: values.includes('1') }),
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
            value: g.description,
            onChange: (e) => patch(tabela, g.id, { description: e.target.value }),
          },
        ],
      },
    ],
  };
}

// ─── Schema do subcard LINHAS (form_rows) ───────────────────────────────────

function rowSchema(
  grupoId: string,
  r: RowLocal,
  patch: RowPatch,
  todasColunas: string[],
  colunasUsadas: string[],
  onAddColunas: (escolhidas: string[]) => void,
): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            col: 6,
            label: 'Ordem',
            name: 'sort_order',
            inputMode: 'numeric',
            value: String(r.sort_order),
            onChange: (e) =>
              patch(grupoId, r.id, {
                sort_order: Number.parseInt(e.target.value, 10) || 0,
              }),
          },
          {
            type: 'select',
            col: 6,
            label: 'Gutter (espaço)',
            options: GUTTER_OPCOES,
            valueKey: 'value',
            labelKey: 'label',
            value: r.gutter,
            onChange: (value) => patch(grupoId, r.id, { gutter: value }),
          },
        ],
      },
      {
        fields: [
          {
            col: 12,
            label: 'Nota',
            name: 'note',
            maxLength: 255,
            placeholder: 'Nota interna',
            value: r.note,
            onChange: (e) => patch(grupoId, r.id, { note: e.target.value }),
          },
        ],
      },
      {
        fields: [
          {
            type: 'select',
            col: 12,
            label: `Colunas (${r.columns.length}/${MAX_COLUNAS_POR_LINHA})`,
            multiple: true,
            rows: 10,
            placeholder: 'Filtrar colunas...',
            valueKey: 'name',
            labelKey: 'name',
            // Listbox alto com a lista completa das colunas; as já usadas por
            // qualquer linha entram como <option disabled> (cinza, permanecem na
            // lista). A seleção não "gruda" (values fixo em []) — cada escolha só
            // acrescenta a coluna e dispara o subcard CAMPO correspondente.
            options: todasColunas.map((name) => ({ name })),
            disabledValues: colunasUsadas,
            values: [],
            onChangeMultiple: (values) => onAddColunas(values),
          },
        ],
      },
    ],
  };
}

// ─── Schema do subcard CAMPO (form_fields) — 1 por coluna selecionada ───────
//
// Blocos: Estrutura + Estado/validação (sempre) + Específico — {tipo} (de
// CAMPOS_POR_TIPO). `form_row_id` é implícito e nunca aparece. Só entra o que
// alguém preenche ao criar o field; atributos DOM soltos e `style_json` ficam
// fora (renderer/submit cuidam). A config do `select` (`sel_*`) é serializada em
// `select_config_json` por `camposParaPayload()`.

type CampoSet = (patch: Partial<CampoLocal>) => void;

/** Um campo do bloco "Específico — {tipo}". */
function colunaField(
  nome: string,
  c: CampoLocal,
  set: CampoSet,
  keyBase: string,
): AnyFieldSchema | null {
  const flag = (
    campo:
      | 'no_numbers' | 'no_letters' | 'no_special_chars' | 'strong_password'
      | 'double_field' | 'equal_fields' | 'with_seconds' | 'show_counter'
      | 'inline' | 'sel_multiple',
    label: string,
  ): AnyFieldSchema => ({
    type: 'checkbox',
    col: 6,
    name: `${campo}-${keyBase}`,
    inline: true,
    options: [{ id: `${campo}-${keyBase}`, value: '1', label }],
    value: c[campo] ? ['1'] : [],
    onChange: (values) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = values.includes('1');
      set(patch);
    },
  });

  const json = (
    campo: 'options_json' | 'datalist_json' | 'allowed_domains_json',
    label: string,
  ): AnyFieldSchema => ({
    type: 'textarea',
    col: 12,
    label,
    rows: 2,
    value: c[campo],
    onChange: (e) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = e.target.value;
      set(patch);
    },
  });

  const txt = (
    campo:
      | 'sel_src' | 'sel_value_key' | 'sel_label_key' | 'sel_label_template'
      | 'sel_max_visible' | 'sel_rows' | 'sel_auth_token' | 'sel_find_src'
      | 'sel_find_column' | 'sel_get_src',
    label: string,
    col: 3 | 4 | 6 | 12 = 4,
    numeric = false,
  ): AnyFieldSchema => ({
    type: 'text',
    col,
    label,
    name: `${campo}-${keyBase}`,
    ...(numeric ? { inputMode: 'numeric' as const } : {}),
    value: c[campo],
    onChange: (e) => {
      const patch: Partial<CampoLocal> = {};
      patch[campo] = numeric ? e.target.value.replace(/\D/g, '') : e.target.value;
      set(patch);
    },
  });

  switch (nome) {
    case 'datalist_json':
      return json('datalist_json', 'datalist_json — ["opção 1", "opção 2"]');
    case 'options_json':
      return json('options_json', 'options_json — [{ id, value, label, checked }]');
    case 'allowed_domains_json':
      return json('allowed_domains_json', 'allowed_domains_json — ["gov.br", "com.br"]');
    case 'no_numbers':
      return flag('no_numbers', 'Sem números');
    case 'no_letters':
      return flag('no_letters', 'Sem letras');
    case 'no_special_chars':
      return flag('no_special_chars', 'Sem caracteres especiais');
    case 'strong_password':
      return flag('strong_password', 'Senha forte');
    case 'double_field':
      return flag('double_field', 'Campo de confirmação');
    case 'equal_fields':
      return flag('equal_fields', 'Exige campos iguais');
    case 'with_seconds':
      return flag('with_seconds', 'Com segundos');
    case 'show_counter':
      return flag('show_counter', 'Mostrar contador');
    case 'inline':
      return flag('inline', 'Inline');
    case 'sel_multiple':
      return flag('sel_multiple', 'Múltipla seleção');
    case 'rows_qty':
      return {
        type: 'text',
        col: 4,
        label: 'Linhas (rows_qty)',
        name: `rows_qty-${keyBase}`,
        inputMode: 'numeric',
        value: c.rows_qty,
        onChange: (e) => set({ rows_qty: e.target.value.replace(/\D/g, '') }),
      };
    case 'min_date':
      return {
        type: 'data',
        col: 6,
        label: 'Data mínima (min_date)',
        value: c.min_date,
        onChange: (e) => set({ min_date: e.target.value }),
      };
    case 'max_date':
      return {
        type: 'data',
        col: 6,
        label: 'Data máxima (max_date)',
        value: c.max_date,
        onChange: (e) => set({ max_date: e.target.value }),
      };
    case 'sel_src':
      return txt('sel_src', 'src (GET das opções)', 12);
    case 'sel_value_key':
      return txt('sel_value_key', 'valueKey', 4);
    case 'sel_label_key':
      return txt('sel_label_key', 'labelKey', 4);
    case 'sel_label_template':
      return txt('sel_label_template', 'labelTemplate', 4);
    case 'sel_max_visible':
      return txt('sel_max_visible', 'maxVisible', 3, true);
    case 'sel_rows':
      return txt('sel_rows', 'rows (dropdown)', 3, true);
    case 'sel_auth_token':
      return txt('sel_auth_token', 'authToken (Bearer)', 6);
    case 'sel_find_src':
      return txt('sel_find_src', 'findSrc (POST de busca)', 6);
    case 'sel_find_column':
      return txt('sel_find_column', 'findColumn', 6);
    case 'sel_get_src':
      return txt('sel_get_src', 'getSrc (GET por id)', 6);
    default:
      return null;
  }
}

function campoSchema(keyBase: string, c: CampoLocal, set: CampoSet): FormGridSchema {
  const rows: FormRowSchema[] = [
    {
      sectionTitle: 'Estrutura',
      fields: [
        {
          type: 'select',
          col: 4,
          label: 'Tipo (field_type)',
          options: FIELD_TYPE_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: c.field_type,
          onChange: (value) => set({ field_type: value }),
        },
        {
          type: 'select',
          col: 4,
          label: 'Largura (col 1–12)',
          options: COL_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: String(c.col),
          onChange: (value) => set({ col: Number.parseInt(value, 10) || 12 }),
        },
        {
          col: 4,
          label: 'Ordem (sort_order)',
          name: `sort_order-${keyBase}`,
          inputMode: 'numeric',
          value: String(c.sort_order),
          onChange: (e) =>
            set({ sort_order: Number.parseInt(e.target.value, 10) || 0 }),
        },
      ],
    },
    {
      fields: [
        {
          col: 12,
          label: 'Label',
          name: `label-${keyBase}`,
          maxLength: 255,
          value: c.label,
          onChange: (e) => set({ label: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          col: 6,
          label: 'Name (field_name)',
          name: `field_name-${keyBase}`,
          maxLength: 255,
          value: c.field_name,
          onChange: (e) => set({ field_name: e.target.value }),
        },
        {
          col: 6,
          label: 'Key (field_key → id)',
          name: `field_key-${keyBase}`,
          maxLength: 255,
          value: c.field_key,
          onChange: (e) => set({ field_key: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          col: 6,
          label: 'Placeholder',
          name: `placeholder-${keyBase}`,
          maxLength: 255,
          value: c.placeholder,
          onChange: (e) => set({ placeholder: e.target.value }),
        },
        {
          col: 6,
          label: 'Valor padrão (default_value)',
          name: `default_value-${keyBase}`,
          maxLength: 255,
          value: c.default_value,
          onChange: (e) => set({ default_value: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          type: 'textarea',
          col: 12,
          label: 'Texto de ajuda (help_text)',
          rows: 2,
          showCounter: true,
          value: c.help_text,
          onChange: (e) => set({ help_text: e.target.value }),
        },
      ],
    },
    {
      sectionTitle: 'Estado e validação',
      fields: [
        {
          type: 'checkbox',
          col: 12,
          name: `estado-${keyBase}`,
          inline: true,
          options: [
            { id: `required-${keyBase}`, value: 'required', label: 'Obrigatório' },
            { id: `disabled-${keyBase}`, value: 'disabled', label: 'Desabilitado' },
            { id: `read_only-${keyBase}`, value: 'read_only', label: 'Somente leitura' },
            { id: `is_hidden-${keyBase}`, value: 'is_hidden', label: 'Oculto' },
          ],
          value: [
            c.required ? 'required' : '',
            c.disabled ? 'disabled' : '',
            c.read_only ? 'read_only' : '',
            c.is_hidden ? 'is_hidden' : '',
          ].filter(Boolean),
          onChange: (values) =>
            set({
              required: values.includes('required'),
              disabled: values.includes('disabled'),
              read_only: values.includes('read_only'),
              is_hidden: values.includes('is_hidden'),
            }),
        },
      ],
    },
    {
      fields: [
        {
          col: 3,
          label: 'Mín. caracteres',
          name: `min_length-${keyBase}`,
          inputMode: 'numeric',
          value: c.min_length,
          onChange: (e) => set({ min_length: e.target.value.replace(/\D/g, '') }),
        },
        {
          col: 3,
          label: 'Máx. caracteres',
          name: `max_length-${keyBase}`,
          inputMode: 'numeric',
          value: c.max_length,
          onChange: (e) => set({ max_length: e.target.value.replace(/\D/g, '') }),
        },
        {
          col: 6,
          label: 'Pattern (regex)',
          name: `pattern-${keyBase}`,
          maxLength: 255,
          value: c.pattern,
          onChange: (e) => set({ pattern: e.target.value }),
        },
      ],
    },
    {
      fields: [
        {
          type: 'select',
          col: 6,
          label: 'input_mode',
          options: INPUT_MODE_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: c.input_mode,
          onChange: (value) => set({ input_mode: value }),
        },
        {
          col: 6,
          label: 'autocomplete',
          name: `autocomplete-${keyBase}`,
          maxLength: 64,
          value: c.autocomplete,
          onChange: (e) => set({ autocomplete: e.target.value }),
        },
      ],
    },
  ];

  const especificas = (CAMPOS_POR_TIPO[c.field_type] ?? [])
    .map((nome) => colunaField(nome, c, set, keyBase))
    .filter((f): f is AnyFieldSchema => f !== null);
  if (especificas.length > 0) {
    rows.push({ sectionTitle: `Específico — ${c.field_type}`, fields: especificas });
  }

  return { rows };
}

// ─── Página ────────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [tabelasDisponiveis, setTabelasDisponiveis] = useState<TabelaInfo[]>([]);
  const [tabelasLoading, setTabelasLoading] = useState(true);
  const [tabelasErro, setTabelasErro] = useState<string | null>(null);

  const [tabelas, setTabelas] = useState<string[]>([]);
  const [managers, setManagers] = useState<Record<string, ManagerLocal>>({});
  // Cache das colunas por tabela (2a API) — renderizado no select "Colunas" de cada linha.
  const [colunas, setColunas] = useState<Record<string, ColunasState>>({});
  const [grupos, setGrupos] = useState<Record<string, GrupoLocal[]>>({});
  // Linhas (form_rows) por grupo — chave = grupo.id (uuid).
  const [linhas, setLinhas] = useState<Record<string, RowLocal[]>>({});
  // Campos (form_fields) por linha e coluna — chave = linha.id -> coluna.name.
  const [campos, setCampos] = useState<
    Record<string, Record<string, CampoLocal>>
  >({});

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
        setTabelasErro(
          err instanceof ApiError ? err.message : 'Falha ao carregar as tabelas.',
        );
        setTabelasLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, []);

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
          [tabela]: {
            loading: false,
            error: null,
            items: rows.map(toColuna).filter((c) => c.name !== ''),
          },
        }));
      })
      .catch((err: unknown) => {
        setColunas((prev) => ({
          ...prev,
          [tabela]: {
            loading: false,
            error:
              err instanceof ApiError ? err.message : 'Falha ao carregar as colunas.',
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
          if (!next[t]) next[t] = managerInicial();
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

  const adicionarGrupo = useCallback((tabela: string) => {
    setGrupos((prev) => ({
      ...prev,
      [tabela]: [...(prev[tabela] ?? []), grupoInicial()],
    }));
  }, []);

  const atualizarGrupo = useCallback<GrupoPatch>((tabela, id, patch) => {
    setGrupos((prev) => ({
      ...prev,
      [tabela]: (prev[tabela] ?? []).map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const adicionarLinha = useCallback((grupoId: string) => {
    setLinhas((prev) => ({
      ...prev,
      [grupoId]: [...(prev[grupoId] ?? []), rowInicial()],
    }));
  }, []);

  const atualizarLinha = useCallback<RowPatch>((grupoId, id, patch) => {
    setLinhas((prev) => ({
      ...prev,
      [grupoId]: (prev[grupoId] ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  // Acrescenta colunas à linha e cria o CampoLocal (seed pela metadata) de cada
  // coluna nova. Entradas em `campos` sem coluna correspondente em `r.columns`
  // (excedente do teto 12) ficam ociosas — nunca são renderizadas.
  const adicionarColunasLinha = useCallback(
    (
      grupoId: string,
      linhaId: string,
      colunasInfo: ColunaInfo[],
      escolhidas: string[],
    ) => {
      setLinhas((prev) => ({
        ...prev,
        [grupoId]: (prev[grupoId] ?? []).map((r) =>
          r.id === linhaId
            ? { ...r, columns: adicionarColunas(r.columns, escolhidas) }
            : r,
        ),
      }));
      setCampos((prev) => {
        const doLinha = { ...(prev[linhaId] ?? {}) };
        let mudou = false;
        escolhidas.forEach((nome) => {
          if (doLinha[nome]) return;
          const info = colunasInfo.find((c) => c.name === nome);
          if (!info) return;
          doLinha[nome] = campoInicial(info, Object.keys(doLinha).length);
          mudou = true;
        });
        return mudou ? { ...prev, [linhaId]: doLinha } : prev;
      });
    },
    [],
  );

  // Remove a coluna da linha e apaga o CampoLocal — a coluna volta a ficar
  // selecionável no listbox.
  const removerColunaLinha = useCallback(
    (grupoId: string, linhaId: string, coluna: string) => {
      setLinhas((prev) => ({
        ...prev,
        [grupoId]: (prev[grupoId] ?? []).map((r) =>
          r.id === linhaId
            ? { ...r, columns: removerColuna(r.columns, coluna) }
            : r,
        ),
      }));
      setCampos((prev) => {
        if (!prev[linhaId]?.[coluna]) return prev;
        const doLinha = { ...prev[linhaId] };
        delete doLinha[coluna];
        return { ...prev, [linhaId]: doLinha };
      });
    },
    [],
  );

  const atualizarCampo = useCallback<CampoPatch>((linhaId, coluna, patch) => {
    setCampos((prev) => {
      const base = prev[linhaId]?.[coluna];
      if (!base) return prev;
      return {
        ...prev,
        [linhaId]: { ...(prev[linhaId] ?? {}), [coluna]: { ...base, ...patch } },
      };
    });
  }, []);

  // Card seletor de tabelas — já era FormGrid.
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

  return (
    <div className="container py-3">
      <div className="card shadow-sm">
        <div className="card-body p-3 p-sm-4">
          {tabelasLoading ? (
            <p className="text-muted small mb-0">Carregando tabelas…</p>
          ) : (
            <FormGrid schema={schema} />
          )}
          {tabelasErro && (
            <div className="alert alert-danger mt-3 mb-0 py-2 small">{tabelasErro}</div>
          )}
        </div>
      </div>

      {tabelas.map((tabela) => {
        const manager = managers[tabela] ?? managerInicial();
        // Lista completa das colunas da tabela + as já usadas por qualquer linha
        // (de qualquer grupo) — estas entram como <option disabled> em todos os
        // selects da tabela.
        const todasColunas = (colunas[tabela]?.items ?? []).map((c) => c.name);
        const colunasUsadas = [
          ...new Set(
            (grupos[tabela] ?? []).flatMap((g) =>
              (linhas[g.id] ?? []).flatMap((r) => r.columns),
            ),
          ),
        ];
        return (
          <div className="card shadow-sm mt-3" key={tabela}>
            <div className="card-header">
              <span className="fw-semibold text-nowrap">{tabela}</span>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <span className="fw-semibold small text-uppercase text-muted">
                  Formulário
                </span>
              </div>
              <div className="card bg-body-tertiary mb-3">
                <div className="card-body py-2">
                  <FormGrid schema={managerSchema(tabela, manager, atualizarManager)} />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold small text-uppercase text-muted">
                  Grupos
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  title="Adicionar grupo"
                  onClick={() => adicionarGrupo(tabela)}
                >
                  +
                </button>
              </div>

              {(grupos[tabela] ?? []).map((grupo) => (
                <div className="card bg-body-tertiary mb-2" key={grupo.id}>
                  <div className="card-body py-2">
                    <FormGrid schema={grupoSchema(tabela, grupo, atualizarGrupo)} />
                    <div className="row g-3">
                      <div className="col-md-6 mb-1">
                        <label className="form-label">Ícone</label>
                        <IconSelect
                          value={grupo.icon}
                          onChange={(nome) =>
                            atualizarGrupo(tabela, grupo.id, { icon: nome })
                          }
                        />
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
                      <span className="fw-semibold small text-uppercase text-muted">
                        Linhas
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="Adicionar linha"
                        onClick={() => adicionarLinha(grupo.id)}
                      >
                        +
                      </button>
                    </div>

                    {colunas[tabela]?.loading && (
                      <p className="text-muted small mb-2">Carregando colunas…</p>
                    )}
                    {colunas[tabela]?.error && (
                      <div className="alert alert-danger mb-2 py-2 small">
                        {colunas[tabela]?.error}
                      </div>
                    )}

                    {(linhas[grupo.id] ?? []).map((linha) => (
                      <div className="card border mb-2" key={linha.id}>
                        <div className="card-body py-2">
                          <FormGrid
                            schema={rowSchema(
                              grupo.id,
                              linha,
                              atualizarLinha,
                              todasColunas,
                              colunasUsadas,
                              (escolhidas) =>
                                adicionarColunasLinha(
                                  grupo.id,
                                  linha.id,
                                  colunas[tabela]?.items ?? [],
                                  escolhidas,
                                ),
                            )}
                          />

                          {linha.columns.map((coluna, idx) => {
                            const info = (colunas[tabela]?.items ?? []).find(
                              (c) => c.name === coluna,
                            );
                            const campo =
                              campos[linha.id]?.[coluna] ??
                              campoInicial(
                                info ?? {
                                  name: coluna,
                                  data_type: '',
                                  column_type: '',
                                  nullable: true,
                                  key: null,
                                },
                                idx,
                              );
                            return (
                              <div className="card border mt-2" key={coluna}>
                                <div className="card-header d-flex align-items-center justify-content-between py-1 px-2">
                                  <span className="fw-semibold small">
                                    Campo — {coluna}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    aria-label={`Remover campo ${coluna}`}
                                    title="Remover"
                                    onClick={() =>
                                      removerColunaLinha(grupo.id, linha.id, coluna)
                                    }
                                  />
                                </div>
                                <div className="card-body py-2">
                                  <FormGrid
                                    schema={campoSchema(
                                      `${linha.id}-${coluna}`,
                                      campo,
                                      (patch) =>
                                        atualizarCampo(linha.id, coluna, patch),
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
