// Modelo do FormBuilderPage — tipos, defaults e mappers das respostas da API de
// introspecção do banco. Isolado da página: a página só monta estado + schema.

import { toStringList } from '@/utils/jsonList';

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
  /** PK de `form_manager` depois do primeiro Salvar. `null` = ainda não persistido. */
  dbId: number | null;
  slug: string;
  /**
   * Nome real da tabela do banco escolhida no card seletor — fonte da verdade
   * para reabrir o formulário em edição. Gravado 1x na criação (`handleTabelas`),
   * nunca adivinhado a partir de `submit_endpoint`.
   */
  tableName: string;
  title: string;
  description: string;
  /** Lista JSON de slugs de user_roles — ver utils/jsonList. */
  roles: string;
  react_route: string;
  submit_endpoint: string;
  http_method: string;
  status: ManagerStatus;
  version: number;
  /** Só UI: enquanto true, o slug acompanha o título. */
  slugAuto: boolean;
}

export function managerInicial(tableName = ''): ManagerLocal {
  return {
    dbId: null,
    slug: '',
    tableName,
    title: '',
    description: '',
    roles: '',
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
  /** Chave estável de UI (uuid) — key do React e chave de `linhas`. */
  id: string;
  /** PK de `form_groups` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
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
    dbId: null,
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
  /** Chave estável de UI (uuid) — key do React e chave de `campos`. */
  id: string;
  /** PK de `form_rows` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;
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
    dbId: null,
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
  /** PK de `form_fields` depois do Salvar. `null` = ainda não persistido. */
  dbId: number | null;

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
  /** Sozinho ja exige igualdade entre os 2 campos (ver SenhaField). */
  double_field: boolean;
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
    dbId: null,
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

// ─── Mappers estado → payload da API (create / update) ─────────────────────
// Cada camada envia só o que está preenchido: strings e numéricos vazios são
// omitidos (a API é `permit_empty`), booleanos viram 0/1 e a FK do pai entra
// sempre explícita. `id` / timestamps ficam por conta do backend.

type Payload = Record<string, string | number>;

/** Descarta chaves `''` / `null` / `undefined` (mantém `0` e demais números). */
function stripVazios(obj: Record<string, unknown>): Payload {
  const out: Payload = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === null || v === undefined) continue;
    if (typeof v === 'number' || typeof v === 'string') out[k] = v;
  }
  return out;
}

const bit = (b: boolean): number => (b ? 1 : 0);

/** `'12'` → `12`; `''` / inválido → `undefined` (para o `stripVazios` cortar). */
function intOuUndef(s: string): number | undefined {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

/** `ManagerLocal` → corpo de `form-manager/create|update`. */
export function managerPayload(m: ManagerLocal): Payload {
  return stripVazios({
    slug: m.slug,
    table_name: m.tableName,
    title: m.title,
    description: m.description,
    roles: m.roles,
    react_route: m.react_route,
    submit_endpoint: m.submit_endpoint,
    http_method: m.http_method,
    status: m.status,
    version: Number.isFinite(m.version) ? m.version : 1,
  });
}

/** `GrupoLocal` → corpo de `form-groups/create|update` (FK `form_manager_id`). */
export function grupoPayload(g: GrupoLocal, formManagerId: number): Payload {
  return stripVazios({
    form_manager_id: formManagerId,
    title: g.title,
    slug: g.slug,
    description: g.description,
    icon: g.icon,
    sort_order: g.sort_order,
    collapsed: bit(g.collapsed),
  });
}

/** `RowLocal` → corpo de `form-rows/create|update` (FK `form_group_id`). */
export function rowPayload(r: RowLocal, formGroupId: number): Payload {
  return stripVazios({
    form_group_id: formGroupId,
    sort_order: r.sort_order,
    gutter: r.gutter,
    note: r.note,
  });
}

/** `CampoLocal` → corpo de `form-campos/create|update` (FK `form_row_id`). */
export function campoPayload(c: CampoLocal, formRowId: number): Payload {
  return stripVazios({
    form_row_id: formRowId,
    sort_order: c.sort_order,
    field_type: c.field_type,
    col: c.col,
    label: c.label,
    field_name: c.field_name,
    field_key: c.field_key,
    placeholder: c.placeholder,
    default_value: c.default_value,
    help_text: c.help_text,
    required: bit(c.required),
    disabled: bit(c.disabled),
    read_only: bit(c.read_only),
    is_hidden: bit(c.is_hidden),
    min_length: intOuUndef(c.min_length),
    max_length: intOuUndef(c.max_length),
    pattern: c.pattern,
    input_mode: c.input_mode,
    autocomplete: c.autocomplete,
    no_numbers: bit(c.no_numbers),
    no_letters: bit(c.no_letters),
    no_special_chars: bit(c.no_special_chars),
    strong_password: bit(c.strong_password),
    double_field: bit(c.double_field),
    with_seconds: bit(c.with_seconds),
    show_counter: bit(c.show_counter),
    inline: bit(c.inline),
    rows_qty: intOuUndef(c.rows_qty),
    min_date: c.min_date,
    max_date: c.max_date,
    options_json: c.options_json,
    datalist_json: c.datalist_json,
    allowed_domains_json: c.allowed_domains_json,
    ...camposParaPayload(c),
  });
}

// ─── Hidratação: view_form_manager (linhas achatadas) → estado do builder ────
// Inverso dos *Payload(). Usado no modo edição (/v1/form-constructor/update/:id):
// a view devolve 1 linha por campo, prefixos fm_/fg_/fr_/fc_. Linhas com fc_id
// nulo (grupo/linha ainda sem campos) entram sem campo. As chaves de UI (`id`
// uuid) são geradas aqui; o `dbId` de cada nível vem da view — o Salvar de cada
// modal já faz update quando há dbId.

export interface BuilderState {
  /** Nome da tabela dona (para carregar colunas). */
  tabela: string;
  manager: ManagerLocal;
  grupos: GrupoLocal[];
  /** chave = grupo.id (uuid). */
  linhas: Record<string, RowLocal[]>;
  /** chave = linha.id (uuid) -> field_name. */
  campos: Record<string, Record<string, CampoLocal>>;
}

function viewNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function viewStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function viewBit(v: unknown): boolean {
  return v === 1 || v === '1' || v === true;
}

function viewIntStr(v: unknown): string {
  const n = viewNum(v);
  return n === null ? '' : String(n);
}

/** Coluna *_json: string crua se já vier string; objeto do driver → re-serializa. */
function viewJsonStr(v: unknown): string {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return '';
  }
}

/**
 * `/api/v1/calendars/create` → `calendars`. Sem match → slug.
 * Rotas da API são kebab-case (`API_GROUPS`), mas as tabelas reais do banco
 * são snake_case (ex.: `user-manager` → `user_manager`) — converte antes de
 * devolver, senão a introspecção do schema falha para qualquer tabela cujo
 * nome tenha underscore.
 */
export function tabelaDoEndpoint(submitEndpoint: string, slug: string): string {
  const m = /\/v1a?\/([^/?#]+)/.exec(submitEndpoint);
  return (m?.[1] ?? slug).replace(/-/g, '_');
}

/** `fm_roles` (lista JSON ou string simples) → string de lista JSON. */
function normalizeRoles(raw: unknown): string {
  const s = viewStr(raw).trim();
  if (!s) return '';
  if (s.startsWith('[')) return s;
  return toStringList([s]);
}

/** Reverte `select_config_json` → chaves `sel_*` de `CampoLocal`. */
function selConfigToCampo(raw: unknown): Partial<CampoLocal> {
  let cfg: Record<string, unknown> | null = null;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    cfg = raw as Record<string, unknown>;
  } else if (typeof raw === 'string' && raw.trim() !== '') {
    try {
      const p: unknown = JSON.parse(raw);
      if (p && typeof p === 'object' && !Array.isArray(p)) cfg = p as Record<string, unknown>;
    } catch {
      cfg = null;
    }
  }
  if (!cfg) return {};
  const s = (k: string): string => viewStr(cfg[k]);
  return {
    sel_multiple: cfg.multiple === true || cfg.multiple === 1 || cfg.multiple === '1',
    sel_src: s('src'),
    sel_value_key: s('valueKey'),
    sel_label_key: Array.isArray(cfg.labelKey) ? cfg.labelKey.join(',') : s('labelKey'),
    sel_label_template: s('labelTemplate'),
    sel_max_visible: viewIntStr(cfg.maxVisible),
    sel_rows: viewIntStr(cfg.rows),
    sel_auth_token: s('authToken'),
    sel_find_src: s('findSrc'),
    sel_find_column: s('findColumn'),
    sel_get_src: s('getSrc'),
  };
}

function viewRowToCampo(row: Record<string, unknown>, fcId: number): CampoLocal {
  const base = campoInicial(
    { name: viewStr(row.fc_field_name), data_type: '', column_type: '', nullable: true, key: null },
    viewNum(row.fc_sort_order) ?? 0,
  );
  return {
    ...base,
    dbId: fcId,
    field_type: viewStr(row.fc_field_type) || base.field_type,
    col: viewNum(row.fc_col) ?? 12,
    sort_order: viewNum(row.fc_sort_order) ?? 0,
    label: viewStr(row.fc_label),
    field_name: viewStr(row.fc_field_name),
    field_key: viewStr(row.fc_field_key),
    placeholder: viewStr(row.fc_placeholder),
    default_value: viewStr(row.fc_default_value),
    help_text: viewStr(row.fc_help_text),
    required: viewBit(row.fc_required),
    disabled: viewBit(row.fc_disabled),
    read_only: viewBit(row.fc_read_only),
    is_hidden: viewBit(row.fc_is_hidden),
    max_length: viewIntStr(row.fc_max_length),
    min_length: viewIntStr(row.fc_min_length),
    pattern: viewStr(row.fc_pattern),
    input_mode: viewStr(row.fc_input_mode),
    autocomplete: viewStr(row.fc_autocomplete),
    no_numbers: viewBit(row.fc_no_numbers),
    no_letters: viewBit(row.fc_no_letters),
    no_special_chars: viewBit(row.fc_no_special_chars),
    strong_password: viewBit(row.fc_strong_password),
    double_field: viewBit(row.fc_double_field),
    with_seconds: viewBit(row.fc_with_seconds),
    show_counter: viewBit(row.fc_show_counter),
    inline: viewBit(row.fc_inline),
    rows_qty: viewIntStr(row.fc_rows_qty),
    min_date: viewStr(row.fc_min_date),
    max_date: viewStr(row.fc_max_date),
    options_json: viewJsonStr(row.fc_options_json),
    datalist_json: viewJsonStr(row.fc_datalist_json),
    allowed_domains_json: viewJsonStr(row.fc_allowed_domains_json),
    ...selConfigToCampo(row.fc_select_config_json),
  };
}

export function viewRowsToBuilderState(
  rows: readonly Record<string, unknown>[],
): BuilderState | null {
  const head = rows.find((r) => viewNum(r.fm_id) !== null) ?? rows[0];
  if (!head) return null;

  const slug = viewStr(head.fm_slug);
  const tableName = viewStr(head.fm_table_name);
  const submitEndpoint = viewStr(head.fm_submit_endpoint);
  const statusRaw = viewStr(head.fm_status);
  const status: ManagerStatus = (['draft', 'active', 'inactive'] as const).includes(
    statusRaw as ManagerStatus,
  )
    ? (statusRaw as ManagerStatus)
    : 'draft';

  const manager: ManagerLocal = {
    dbId: viewNum(head.fm_id),
    slug,
    tableName,
    title: viewStr(head.fm_title),
    description: viewStr(head.fm_description),
    roles: normalizeRoles(head.fm_roles),
    react_route: viewStr(head.fm_react_route),
    submit_endpoint: submitEndpoint,
    http_method: viewStr(head.fm_http_method) || 'POST',
    status,
    version: viewNum(head.fm_version) ?? 1,
    slugAuto: false,
  };

  const grupos: GrupoLocal[] = [];
  const linhas: Record<string, RowLocal[]> = {};
  const campos: Record<string, Record<string, CampoLocal>> = {};
  const grupoPorDbId = new Map<number, GrupoLocal>();
  const linhaPorDbId = new Map<number, RowLocal>();

  for (const row of rows) {
    const fgId = viewNum(row.fg_id);
    if (fgId === null) continue;

    let g = grupoPorDbId.get(fgId);
    if (!g) {
      g = {
        id: crypto.randomUUID(),
        dbId: fgId,
        title: viewStr(row.fg_title),
        slug: viewStr(row.fg_slug),
        description: viewStr(row.fg_description),
        icon: viewStr(row.fg_icon),
        sort_order: viewNum(row.fg_sort_order) ?? 0,
        collapsed: viewBit(row.fg_collapsed),
        slugAuto: false,
      };
      grupoPorDbId.set(fgId, g);
      grupos.push(g);
      linhas[g.id] = [];
    }

    const frId = viewNum(row.fr_id);
    if (frId === null) continue;

    let r = linhaPorDbId.get(frId);
    if (!r) {
      r = {
        id: crypto.randomUUID(),
        dbId: frId,
        sort_order: viewNum(row.fr_sort_order) ?? 0,
        gutter: viewStr(row.fr_gutter) || 'g-3',
        note: viewStr(row.fr_note),
        columns: [],
      };
      linhaPorDbId.set(frId, r);
      (linhas[g.id] ??= []).push(r);
      campos[r.id] = {};
    }

    const fcId = viewNum(row.fc_id);
    if (fcId === null) continue;

    const fieldName =
      viewStr(row.fc_field_name) || viewStr(row.fc_field_key) || `campo_${fcId}`;
    if (r.columns.includes(fieldName)) continue;
    r.columns.push(fieldName);
    (campos[r.id] ??= {})[fieldName] = viewRowToCampo(row, fcId);
  }

  grupos.sort((a, b) => a.sort_order - b.sort_order);
  for (const arr of Object.values(linhas)) arr.sort((a, b) => a.sort_order - b.sort_order);

  // fm_table_name e a fonte da verdade (gravada na criacao). O heuristico por
  // submit_endpoint fica so como fallback para registros legados sem o campo.
  const tabela = tableName || tabelaDoEndpoint(submitEndpoint, slug) || slug || 'tabela';
  return { tabela, manager, grupos, linhas, campos };
}
