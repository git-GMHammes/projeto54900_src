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
import { Link, useParams } from 'react-router-dom';
import FormGrid from '@/components/ui/FormGrid/Input';
import type {
  AnyFieldSchema,
  FormGridSchema,
  FormRowSchema,
} from '@/components/ui/FormGrid/Input';
import IconSelect from '@/components/ui/IconSelect';
import { FormTree, TreeNode } from './FormBuilderTree';
import FormModal from './FormModal';
import {
  dbSchema,
  formCamposTable,
  formGroupsTable,
  formManagerTable,
  formManagerView,
  formRowsTable,
} from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { ApiError } from '@/services/http';
import { useToast } from '@/hooks/useToast';
import { slugify } from '@/utils/slug';
import { parseStringList, toStringList } from '@/utils/jsonList';
import { paths } from '@/routes/paths';
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
  campoPayload,
  grupoInicial,
  grupoPayload,
  managerInicial,
  managerPayload,
  removerColuna,
  rowInicial,
  rowPayload,
  toColuna,
  toTabela,
  viewRowsToBuilderState,
} from './formBuilder.model';

type ManagerPatch = (tabela: string, patch: Partial<ManagerLocal>) => void;
type GrupoPatch = (tabela: string, id: string, patch: Partial<GrupoLocal>) => void;
type RowPatch = (grupoId: string, id: string, patch: Partial<RowLocal>) => void;
type CampoPatch = (
  linhaId: string,
  coluna: string,
  patch: Partial<CampoLocal>,
) => void;

// Nó cujo formulário está aberto no <FormModal> — um por vez.
type ModalAlvo =
  | { kind: 'manager'; tabela: string }
  | { kind: 'group'; tabela: string; grupoId: string }
  | { kind: 'row'; tabela: string; grupoId: string; linhaId: string }
  | { kind: 'field'; tabela: string; grupoId: string; linhaId: string; coluna: string };

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

/** Sufixo de status de persistência no `name` do nó da árvore. */
const sufixoDbId = (dbId: number | null | undefined): string =>
  dbId ? ` · #${dbId}` : ' · não salvo';

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
            values: parseStringList(m.roles),
            onChangeMultiple: (values) =>
              patch(tabela, { roles: toStringList(values) }),
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
            // Só depois que a linha existe no banco (form_row_id) faz sentido
            // escolher colunas — cada uma vira um form_fields vinculado a ela.
            disabled: !r.dbId,
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

  // select: options_json (lista estática) e src (GET dinâmico) são mutuamente
  // exclusivos — buildField() dá prioridade ao src. Preenchido um, o outro (e
  // as chaves que só servem ao src) fica visível porém desabilitado.
  const temOptions = c.options_json.trim() !== '';
  const temSrc = c.sel_src.trim() !== '';

  const json = (
    campo: 'options_json' | 'datalist_json' | 'allowed_domains_json',
    label: string,
    disabled = false,
  ): AnyFieldSchema => ({
    type: 'textarea',
    col: 12,
    label,
    rows: 2,
    ...(disabled ? { disabled: true } : {}),
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
    disabled = false,
  ): AnyFieldSchema => ({
    type: 'text',
    col,
    label,
    name: `${campo}-${keyBase}`,
    ...(numeric ? { inputMode: 'numeric' as const } : {}),
    ...(disabled ? { disabled: true } : {}),
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
      return json('options_json', 'options_json — [{ id, value, label, checked }]', temSrc);
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
      return txt('sel_src', 'src (GET das opções)', 12, false, temOptions);
    case 'sel_value_key':
      return txt('sel_value_key', 'valueKey', 4, false, temOptions);
    case 'sel_label_key':
      return txt('sel_label_key', 'labelKey', 4, false, temOptions);
    case 'sel_label_template':
      return txt('sel_label_template', 'labelTemplate', 4, false, temOptions);
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
          label: 'Input Mode (Tec. Virtual)',
          options: INPUT_MODE_OPCOES,
          valueKey: 'value',
          labelKey: 'label',
          value: c.input_mode,
          onChange: (value) => set({ input_mode: value }),
        },
        {
          col: 6,
          label: 'Autocomplete',
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
  // Modo edição: /v1/form-constructor/update/:id. Sem :id -> modo criação (padrão).
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
  // Cache das colunas por tabela (2a API) — renderizado no select "Colunas" de cada linha.
  const [colunas, setColunas] = useState<Record<string, ColunasState>>({});
  const [grupos, setGrupos] = useState<Record<string, GrupoLocal[]>>({});
  // Linhas (form_rows) por grupo — chave = grupo.id (uuid).
  const [linhas, setLinhas] = useState<Record<string, RowLocal[]>>({});
  // Campos (form_fields) por linha e coluna — chave = linha.id -> coluna.name.
  const [campos, setCampos] = useState<
    Record<string, Record<string, CampoLocal>>
  >({});

  const toast = useToast();
  // Persistência do nó aberto no modal (um por vez).
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
          if (!next[t]) next[t] = managerInicial(t);
        });
        return next;
      });
      values.forEach((t) => carregarColunas(t));
    },
    [carregarColunas],
  );

  // Modo edição — hidrata todo o estado a partir da view_form_manager do registro.
  // O Salvar de cada nó já faz update quando existe dbId, então a árvore fica
  // editável sem tocar na lógica de persistência.
  useEffect(() => {
    if (recordId === null) return;
    const ctrl = new AbortController();
    setEdicaoLoading(true);
    setEdicaoErro(null);
    void formManagerView
      .getGrouped(
        { fm_id: [recordId] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
        { signal: ctrl.signal },
      )
      .then((raw) => {
        const { rows } = normalizeList<Record<string, unknown>>(raw);
        const st = viewRowsToBuilderState(rows);
        if (!st) {
          setEdicaoErro(`Formulário #${recordId} não encontrado.`);
          setEdicaoLoading(false);
          return;
        }
        setTabelas([st.tabela]);
        setManagers({ [st.tabela]: st.manager });
        setGrupos({ [st.tabela]: st.grupos });
        setLinhas(st.linhas);
        setCampos(st.campos);
        carregarColunas(st.tabela);
        setEdicaoLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setEdicaoErro(
          err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.',
        );
        setEdicaoLoading(false);
      });
    return () => {
      ctrl.abort();
    };
  }, [recordId, carregarColunas]);

  const atualizarManager = useCallback<ManagerPatch>((tabela, patch) => {
    setManagers((prev) => ({
      ...prev,
      [tabela]: { ...(prev[tabela] ?? managerInicial(tabela)), ...patch },
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
  // selecionável no listbox. Se o campo já estava persistido, faz soft delete
  // no banco antes de limpar o estado local.
  const removerColunaLinha = useCallback(
    (grupoId: string, linhaId: string, coluna: string) => {
      const campoAlvo = campos[linhaId]?.[coluna];
      const limparLocal = () => {
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
      };
      if (!campoAlvo?.dbId) {
        limparLocal();
        return;
      }
      void formCamposTable
        .deleteSoft(campoAlvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_fields removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [campos, toast],
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

  const removerGrupo = useCallback(
    (tabela: string, id: string) => {
      const alvo = (grupos[tabela] ?? []).find((g) => g.id === id);
      const limparLocal = () => {
        setGrupos((prev) => ({
          ...prev,
          [tabela]: (prev[tabela] ?? []).filter((g) => g.id !== id),
        }));
        setLinhas((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void formGroupsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_groups removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [grupos, toast],
  );

  const removerLinha = useCallback(
    (grupoId: string, id: string) => {
      const alvo = (linhas[grupoId] ?? []).find((r) => r.id === id);
      const limparLocal = () => {
        setLinhas((prev) => ({
          ...prev,
          [grupoId]: (prev[grupoId] ?? []).filter((r) => r.id !== id),
        }));
        setCampos((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      };
      if (!alvo?.dbId) {
        limparLocal();
        return;
      }
      void formRowsTable
        .deleteSoft(alvo.dbId)
        .then(() => {
          limparLocal();
          toast.success('form_rows removido.');
        })
        .catch((err: unknown) => {
          toast.error(
            err instanceof ApiError ? err.message : 'Falha ao remover no banco.',
          );
        });
    },
    [linhas, toast],
  );

  // Nó cujo formulário está aberto no modal (null = nenhum).
  const [modal, setModal] = useState<ModalAlvo | null>(null);

  // Troca de nó no modal zera o estado de persistência.
  useEffect(() => {
    setSalvando(false);
    setErroSalvar(null);
  }, [modal]);

  // ─── Persistência por nó — Salvar no modal ────────────────────────────────
  // create quando o nó ainda não tem dbId, update quando tem. O id retornado
  // vira a chave que liga a camada filha. Sucesso fecha o modal + toast; erro
  // da API aparece no <FormModal> (saveError). Um filho só pode ser salvo
  // depois do pai — garantido pelo gating dos botões [+] e reforçado aqui.

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
        setErroSalvar(
          err instanceof ApiError ? err.message : 'Falha ao salvar. Tente de novo.',
        );
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
        ? await formManagerTable.update(m.dbId, managerPayload(m))
        : await formManagerTable.create(managerPayload(m));
      atualizarManager(tabela, { dbId: extrairId(raw) });
    }, m.dbId ? 'form_manager atualizado.' : 'form_manager salvo.');
  };

  const salvarGrupo = (tabela: string, grupoId: string) => {
    const fmId = managers[tabela]?.dbId;
    const g = (grupos[tabela] ?? []).find((x) => x.id === grupoId);
    if (!g) return;
    if (!fmId) {
      setErroSalvar('Salve o form_manager antes do grupo.');
      return;
    }
    void executarSalvar(async () => {
      const raw = g.dbId
        ? await formGroupsTable.update(g.dbId, grupoPayload(g, fmId))
        : await formGroupsTable.create(grupoPayload(g, fmId));
      atualizarGrupo(tabela, grupoId, { dbId: extrairId(raw) });
    }, g.dbId ? 'form_groups atualizado.' : 'form_groups salvo.');
  };

  const salvarLinha = (tabela: string, grupoId: string, linhaId: string) => {
    const fgId = (grupos[tabela] ?? []).find((x) => x.id === grupoId)?.dbId;
    const r = (linhas[grupoId] ?? []).find((x) => x.id === linhaId);
    if (!r) return;
    if (!fgId) {
      setErroSalvar('Salve o grupo antes da linha.');
      return;
    }
    void executarSalvar(async () => {
      const raw = r.dbId
        ? await formRowsTable.update(r.dbId, rowPayload(r, fgId))
        : await formRowsTable.create(rowPayload(r, fgId));
      atualizarLinha(grupoId, linhaId, { dbId: extrairId(raw) });
    }, r.dbId ? 'form_rows atualizado.' : 'form_rows salvo.');
  };

  const salvarCampo = (grupoId: string, linhaId: string, coluna: string) => {
    const frId = (linhas[grupoId] ?? []).find((x) => x.id === linhaId)?.dbId;
    const c = campos[linhaId]?.[coluna];
    if (!c) return;
    if (!frId) {
      setErroSalvar('Salve a linha antes do campo.');
      return;
    }
    void executarSalvar(async () => {
      const raw = c.dbId
        ? await formCamposTable.update(c.dbId, campoPayload(c, frId))
        : await formCamposTable.create(campoPayload(c, frId));
      atualizarCampo(linhaId, coluna, { dbId: extrairId(raw) });
    }, c.dbId ? 'form_fields atualizado.' : 'form_fields salvo.');
  };

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

  const fecharModal = () => {
    setModal(null);
    setErroSalvar(null);
  };

  // Formulário do nó aberto — sempre via <FormGrid>, dentro do <FormModal>.
  const renderModal = () => {
    if (!modal) return null;

    if (modal.kind === 'manager') {
      const m = managers[modal.tabela] ?? managerInicial(modal.tabela);
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_manager</code> · {tabela}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarManager(tabela)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid schema={managerSchema(tabela, m, atualizarManager)} />
        </FormModal>
      );
    }

    if (modal.kind === 'group') {
      const g = (grupos[modal.tabela] ?? []).find((x) => x.id === modal.grupoId);
      if (!g) return null;
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_groups</code> · {g.title || 'sem título'}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarGrupo(tabela, g.id)}
          saving={salvando}
          saveError={erroSalvar}
        >
          <FormGrid schema={grupoSchema(tabela, g, atualizarGrupo)} />
          <div className="row g-3">
            <div className="col-md-6 mb-1">
              <label className="form-label">Ícone</label>
              <IconSelect
                value={g.icon}
                onChange={(nome) => atualizarGrupo(modal.tabela, g.id, { icon: nome })}
              />
            </div>
          </div>
        </FormModal>
      );
    }

    if (modal.kind === 'row') {
      const r = (linhas[modal.grupoId] ?? []).find((x) => x.id === modal.linhaId);
      if (!r) return null;
      const todasColunas = (colunas[modal.tabela]?.items ?? []).map((c) => c.name);
      // Colunas já usadas por qualquer linha da tabela — entram como
      // <option disabled> no select "Colunas".
      const colunasUsadas = [
        ...new Set(
          (grupos[modal.tabela] ?? []).flatMap((g) =>
            (linhas[g.id] ?? []).flatMap((rr) => rr.columns),
          ),
        ),
      ];
      const tabela = modal.tabela;
      return (
        <FormModal
          title={
            <>
              <code>form_rows</code> · {r.note || `linha ${r.sort_order}`}
            </>
          }
          onClose={fecharModal}
          onSave={() => salvarLinha(tabela, modal.grupoId, r.id)}
          saving={salvando}
          saveError={erroSalvar}
        >
          {!r.dbId && (
            <p className="text-body-secondary small mb-2">
              Salve a linha (botão <span className="fw-semibold">Salvar</span>) para
              escolher as colunas — cada uma vira um <code>form_fields</code> ligado a
              ela.
            </p>
          )}
          {colunas[tabela]?.loading && (
            <p className="text-body-secondary small">Carregando colunas…</p>
          )}
          {colunas[tabela]?.error && (
            <div className="alert alert-danger py-2 small">
              {colunas[tabela]?.error}
            </div>
          )}
          <FormGrid
            schema={rowSchema(
              modal.grupoId,
              r,
              atualizarLinha,
              todasColunas,
              colunasUsadas,
              (escolhidas) =>
                adicionarColunasLinha(
                  modal.grupoId,
                  r.id,
                  colunas[modal.tabela]?.items ?? [],
                  escolhidas,
                ),
            )}
          />
        </FormModal>
      );
    }

    // modal.kind === 'field'
    const campo = campos[modal.linhaId]?.[modal.coluna];
    if (!campo) return null;
    const { grupoId, linhaId, coluna } = modal;
    return (
      <FormModal
        title={
          <>
            <code>form_fields</code> · {coluna}
          </>
        }
        onClose={fecharModal}
        onSave={() => salvarCampo(grupoId, linhaId, coluna)}
        saving={salvando}
        saveError={erroSalvar}
      >
        <FormGrid
          schema={campoSchema(
            `${linhaId}-${coluna}`,
            campo,
            (patch) => atualizarCampo(linhaId, coluna, patch),
          )}
        />
      </FormModal>
    );
  };

  return (
    <div className="container py-3">
      {modoEdicao ? (
        <div className="card shadow-sm">
          <div className="card-body p-3 p-sm-4">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <h1 className="h5 mb-1">
                Editar formulário <span className="text-body-secondary">#{recordId}</span>
              </h1>
              <Link className="btn btn-sm btn-outline-secondary" to={paths.v1.form.list}>
                Voltar
              </Link>
            </div>
            <p className="text-body-secondary small mb-0">
              {edicaoLoading
                ? 'Carregando definição…'
                : tabelas[0]
                  ? `Tabela: ${tabelas[0]}`
                  : '—'}
            </p>
            {edicaoErro && (
              <div className="alert alert-danger mt-3 mb-0 py-2 small">{edicaoErro}</div>
            )}
          </div>
        </div>
      ) : (
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
      )}

      {tabelas.map((tabela) => {
        const gruposTabela = grupos[tabela] ?? [];
        const managerId = `manager:${tabela}`;
        return (
          <div className="card shadow-sm mt-3" key={tabela}>
            <div className="card-header">
              <span className="fw-semibold text-nowrap">{tabela}</span>
            </div>
            <div className="card-body">
              {/* Hierarquia form_manager → form_groups → form_rows → form_fields:
                  cada nível é uma linha colapsável; o formulário abre no modal. */}
              <FormTree>
                <TreeNode
                  id={managerId}
                  parents={[]}
                  level="manager"
                  name={`${tabela}${sufixoDbId(managers[tabela]?.dbId)}`}
                  count={gruposTabela.length}
                  addLabel="form_groups"
                  addDisabled={!managers[tabela]?.dbId}
                  onAdd={() => adicionarGrupo(tabela)}
                  onEdit={() => setModal({ kind: 'manager', tabela })}
                >
                  {gruposTabela.length === 0 ? (
                    <p className="text-body-secondary small fst-italic py-1 mb-0">
                      Sem grupos — use <span className="fw-semibold">+ form_groups</span>.
                    </p>
                  ) : null}

                  {gruposTabela.map((grupo) => {
                    const groupId = `group:${grupo.id}`;
                    const linhasGrupo = linhas[grupo.id] ?? [];
                    return (
                      <TreeNode
                        key={grupo.id}
                        id={groupId}
                        parents={[managerId]}
                        level="group"
                        name={`${grupo.title || 'sem título'}${sufixoDbId(grupo.dbId)}`}
                        count={linhasGrupo.length}
                        addLabel="form_rows"
                        addDisabled={!grupo.dbId}
                        onAdd={() => adicionarLinha(grupo.id)}
                        onEdit={() => setModal({ kind: 'group', tabela, grupoId: grupo.id })}
                        onRemove={() => removerGrupo(tabela, grupo.id)}
                      >
                        {linhasGrupo.length === 0 ? (
                          <p className="text-body-secondary small fst-italic py-1 mb-0">
                            Sem linhas — use{' '}
                            <span className="fw-semibold">+ form_rows</span>.
                          </p>
                        ) : null}

                        {linhasGrupo.map((linha) => {
                          const rowId = `row:${linha.id}`;
                          const alvoLinha: ModalAlvo = {
                            kind: 'row',
                            tabela,
                            grupoId: grupo.id,
                            linhaId: linha.id,
                          };
                          return (
                            <TreeNode
                              key={linha.id}
                              id={rowId}
                              parents={[managerId, groupId]}
                              level="row"
                              name={`${linha.note || `linha ${linha.sort_order}`}${sufixoDbId(
                                linha.dbId,
                              )}`}
                              count={linha.columns.length}
                              addLabel="form_fields"
                              addDisabled={!linha.dbId}
                              onAdd={() => setModal(alvoLinha)}
                              onEdit={() => setModal(alvoLinha)}
                              onRemove={() => removerLinha(grupo.id, linha.id)}
                            >
                              {linha.columns.length === 0 ? (
                                <p className="text-body-secondary small fst-italic py-1 mb-0">
                                  Sem campos — em{' '}
                                  <span className="fw-semibold">form_fields</span> selecione
                                  colunas.
                                </p>
                              ) : null}

                              {linha.columns.map((coluna) => (
                                <TreeNode
                                  key={coluna}
                                  id={`field:${linha.id}:${coluna}`}
                                  parents={[managerId, groupId, rowId]}
                                  level="field"
                                  name={`${coluna}${sufixoDbId(
                                    campos[linha.id]?.[coluna]?.dbId,
                                  )}`}
                                  onEdit={() =>
                                    setModal({
                                      kind: 'field',
                                      tabela,
                                      grupoId: grupo.id,
                                      linhaId: linha.id,
                                      coluna,
                                    })
                                  }
                                  onRemove={() =>
                                    removerColunaLinha(grupo.id, linha.id, coluna)
                                  }
                                />
                              ))}
                            </TreeNode>
                          );
                        })}
                      </TreeNode>
                    );
                  })}
                </TreeNode>
              </FormTree>
            </div>
          </div>
        );
      })}

      {renderModal()}
    </div>
  );
}
