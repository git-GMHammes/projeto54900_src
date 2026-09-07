// Tipos compartilhados da camada de API/servicos. Fonte unica de verdade dos
// contratos que atravessam http -> services -> hooks -> paginas.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type SortOrder = 'ASC' | 'DESC';

// Valores aceitos numa querystring da API (?page=&limit=&sort=&order=&q=...).
export type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export type QueryParams = Record<string, QueryValue>;

// Parametros de paginacao ja normalizados (com defaults aplicados).
export interface PageParams {
  page: number;
  limit: number;
  sort: string;
  order: SortOrder;
}

// Paginacao como enviada numa request: subconjunto de PageParams + extras livres.
export type PaginationInput = Partial<PageParams> & QueryParams;

// Opcoes de uma chamada HTTP.
export interface RequestOptions {
  params?: QueryParams | undefined;
  body?: unknown;
  headers?: Record<string, string> | undefined;
  signal?: AbortSignal | undefined;
}

// Opcoes repassadas pelos services (sem body; o service monta o body).
export type CallOptions = Omit<RequestOptions, 'body'>;

export interface ApiErrorInit {
  status?: number;
  data?: unknown;
  url?: string;
}

// Linha generica devolvida pela API antes de qualquer modelagem especifica.
export type ApiRow = Record<string, unknown>;

// Resultado de normalizeList().
export interface NormalizedList<T = ApiRow> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
}
