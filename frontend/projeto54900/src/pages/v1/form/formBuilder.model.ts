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
}

export function rowInicial(): RowLocal {
  return {
    id: crypto.randomUUID(),
    sort_order: 0,
    gutter: 'g-3',
    note: '',
  };
}
