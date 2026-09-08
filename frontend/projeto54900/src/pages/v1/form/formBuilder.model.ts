// Modelo do FormBuilderPage — tipos, defaults e mappers das respostas da API de
// introspecção do banco. Isolado da página: a página só monta estado + schema.

// ─── Tabelas / colunas (API db-schema) ──────────────────────────────────────

export interface TabelaInfo {
  name: string;
  type: string;
}

export interface ColunaInfo {
  name: string;
  data_type: string;
  column_type: string;
  nullable: boolean;
  key: string | null;
}

export interface ColunasState {
  loading: boolean;
  error: string | null;
  items: ColunaInfo[];
}

/** Coerção defensiva de um valor arbitrário de linha da API para string. */
export function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export function toTabela(row: Record<string, unknown>): TabelaInfo {
  return { name: asString(row.name), type: asString(row.type) || 'table' };
}

export function toColuna(row: Record<string, unknown>): ColunaInfo {
  return {
    name: asString(row.name),
    data_type: asString(row.data_type),
    column_type: asString(row.column_type),
    nullable: row.nullable === true,
    key: typeof row.key === 'string' && row.key !== '' ? row.key : null,
  };
}

// ─── form_manager (1:1 com a tabela escolhida) ──────────────────────────────

export type ManagerStatus = 'draft' | 'active' | 'inactive';

export interface ManagerLocal {
  slug: string;
  title: string;
  description: string;
  /** Lista JSON de slugs de user_roles — ver utils/jsonList. */
  profile_group: string;
  react_route: string;
  submit_endpoint: string;
  http_method: string;
  status: ManagerStatus;
  version: number;
  /** Só UI: enquanto true, o slug acompanha o título. */
  slugAuto: boolean;
}

export function managerInicial(): ManagerLocal {
  return {
    slug: '',
    title: '',
    description: '',
    profile_group: '',
    react_route: '',
    submit_endpoint: '',
    http_method: 'POST',
    status: 'draft',
    version: 1,
    slugAuto: true,
  };
}

// ─── form_groups (N por tabela) ─────────────────────────────────────────────

export interface GrupoLocal {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  collapsed: boolean;
  /** Só UI: enquanto true, o slug acompanha o title. */
  slugAuto: boolean;
}

export function grupoInicial(): GrupoLocal {
  return {
    id: crypto.randomUUID(),
    title: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    collapsed: false,
    slugAuto: true,
  };
}

// ─── form_rows (N por grupo) ───────────────────────────────────────────────

export interface RowLocal {
  id: string;
  sort_order: number;
  /** Classe de gap do Bootstrap na `row` (g-0 … g-5). */
  gutter: string;
  note: string;
  /**
   * Colunas da tabela dona escolhidas nesta linha. Estado só de UI — `form_rows`
   * não tem coluna correspondente no banco; alimenta a montagem futura dos
   * `form_fields`. Nomes de coluna (`ColunaInfo.name`).
   */
  columns: string[];
}

export function rowInicial(): RowLocal {
  return {
    id: crypto.randomUUID(),
    sort_order: 0,
    gutter: 'g-3',
    note: '',
    columns: [],
  };
}

// ─── Distribuição das colunas entre as linhas (estado só de UI) ─────────────
// Cada coluna da tabela vai para no máximo uma linha. O select de cada linha
// mostra a lista completa das colunas; as já usadas por qualquer linha entram
// como `<option disabled>` (prop `disabledValues` do `<FormGrid>` select).

export const MAX_COLUNAS_POR_LINHA = 12;

/**
 * Acrescenta `escolhidas` a `atuais` (sem duplicar), respeitando o teto `max`.
 * O que exceder `max` é descartado.
 */
export function adicionarColunas(
  atuais: string[],
  escolhidas: string[],
  max = MAX_COLUNAS_POR_LINHA,
): string[] {
  const out = [...atuais];
  for (const nome of escolhidas) {
    if (out.length >= max) break;
    if (!out.includes(nome)) out.push(nome);
  }
  return out;
}

/** Remove `nome` de `atuais` — a coluna volta ao pool no próximo render. */
export function removerColuna(atuais: string[], nome: string): string[] {
  return atuais.filter((c) => c !== nome);
}

// ─── form_fields (1 por coluna selecionada na linha) ───────────────────────
// Cada coluna escolhida no listbox da LINHA gera um CampoLocal, pré-preenchido
// pela metadata da coluna. Estado só de UI. Só entra na UI o que alguém preenche
// ao criar um field: as colunas de conteúdo/validação + o que cada
// `<Tipo>FieldSchema` de `src/components/ui/FormGrid` declara como config de
// produto. Atributos DOM soltos (title, className, tabIndex, size, cols, dir,
// lang, spellCheck, autoFocus, list) e `style_json` ficam sem UI — renderer /
// submit definem default/null. Config do `select` vai em `sel_*` →
// `select_config_json` via `camposParaPayload()`. `options_json` / `datalist_json`
// / `allowed_domains_json` seguem textarea cru (editor estruturado é etapa à parte).

export interface CampoLocal {
  // -- Estrutura -----------------------------------------------------------
  /** Enum `field_type` do banco (default `text`). */
  field_type: string;
  /** 1..12 — largura Bootstrap (`col`). */
  col: number;
  sort_order: number;
  label: string;
  /** Vira o atributo `name` do campo renderizado (`field_name`). */
  field_name: string;
  /** Vira o atributo `id` do campo renderizado (`field_key`). */
  field_key: string;
  placeholder: string;
  default_value: string;
  help_text: string;

  // -- Estado / validação ------------------------------------------------
  required: boolean;
  disabled: boolean;
  read_only: boolean;
  is_hidden: boolean;
  /** INT no banco; `''` = não definido. */
  max_length: string;
  /** INT no banco; `''` = não definido. */
  min_length: string;
  pattern: string;
  input_mode: string;
  autocomplete: string;

  // -- Flags por tipo --------------------------------------------------
  no_numbers: boolean;
  no_letters: boolean;
  no_special_chars: boolean;
  strong_password: boolean;
  double_field: boolean;
  equal_fields: boolean;
  with_seconds: boolean;
  show_counter: boolean;
  inline: boolean;
  /** INT no banco; `''` = não definido. */
  rows_qty: string;
  /** ISO `YYYY-MM-DD`; `''` = não definido. */
  min_date: string;
  max_date: string;

  // -- Arrays (JSON cru — editor estruturado é etapa à parte) --------
  options_json: string;
  datalist_json: string;
  allowed_domains_json: string;

  // -- Config do `select` (→ serializada em `select_config_json`) ----
  sel_multiple: boolean;
  sel_src: string;
  sel_value_key: string;
  sel_label_key: string;
  sel_label_template: string;
  /** INT; `''` = não definido. */
  sel_max_visible: string;
  /** INT; `''` = não definido. */
  sel_rows: string;
  sel_auth_token: string;
  sel_find_src: string;
  sel_find_column: string;
  sel_get_src: string;
}

/** Chuta o `field_type` a partir do `data_type` da coluna. */
export function inferirFieldType(dataType: string): string {
  const t = dataType.toLowerCase();
  if (t.includes('text')) return 'textarea';
  if (t === 'date') return 'data';
  if (t === 'time') return 'hora';
  if (t === 'datetime' || t === 'timestamp') return 'data';
  if (t === 'enum' || t === 'set') return 'select';
  return 'text';
}

export function campoInicial(coluna: ColunaInfo, sortOrder: number): CampoLocal {
  return {
    field_type: inferirFieldType(coluna.data_type),
    col: 12,
    sort_order: sortOrder,
    label: coluna.name,
    field_name: coluna.name,
    field_key: coluna.name,
    placeholder: '',
    default_value: '',
    help_text: '',
    required: !coluna.nullable,
    disabled: false,
    read_only: false,
    is_hidden: false,
    max_length: '',
    min_length: '',
    pattern: '',
    input_mode: '',
    autocomplete: '',
    no_numbers: false,
    no_letters: false,
    no_special_chars: false,
    strong_password: false,
    double_field: false,
    equal_fields: false,
    with_seconds: false,
    show_counter: false,
    inline: false,
    rows_qty: '',
    min_date: '',
    max_date: '',
    options_json: '',
    datalist_json: '',
    allowed_domains_json: '',
    sel_multiple: false,
    sel_src: '',
    sel_value_key: '',
    sel_label_key: '',
    sel_label_template: '',
    sel_max_visible: '',
    sel_rows: '',
    sel_auth_token: '',
    sel_find_src: '',
    sel_find_column: '',
    sel_get_src: '',
  };
}

/**
 * Serializa a config do `select` (`sel_*`) em `select_config_json`. Chaves
 * vazias/`false` omitidas; objeto vazio vira `''`. Usado no `submit` futuro — o
 * resto de `CampoLocal` mapeia 1:1 nas colunas.
 */
export function camposParaPayload(c: CampoLocal): { select_config_json: string } {
  const sel: Record<string, string | number | boolean> = {};
  if (c.sel_multiple) sel.multiple = true;
  if (c.sel_src) sel.src = c.sel_src;
  if (c.sel_value_key) sel.valueKey = c.sel_value_key;
  if (c.sel_label_key) sel.labelKey = c.sel_label_key;
  if (c.sel_label_template) sel.labelTemplate = c.sel_label_template;
  if (c.sel_max_visible) sel.maxVisible = Number.parseInt(c.sel_max_visible, 10);
  if (c.sel_rows) sel.rows = Number.parseInt(c.sel_rows, 10);
  if (c.sel_auth_token) sel.authToken = c.sel_auth_token;
  if (c.sel_find_src) sel.findSrc = c.sel_find_src;
  if (c.sel_find_column) sel.findColumn = c.sel_find_column;
  if (c.sel_get_src) sel.getSrc = c.sel_get_src;

  return {
    select_config_json: Object.keys(sel).length > 0 ? JSON.stringify(sel) : '',
  };
}
