// Montagem/leitura de querystring no padrao da API: ?page=&limit=&sort=&order=

import { PAGINATION_DEFAULTS } from '@/constants/api';
import type { PageParams, QueryParams, SortOrder } from '@/types/api';

// Objeto -> "?a=1&b=2". Ignora null/undefined/'' . Nao inclui a "?" se vazio.
export function toQueryString(params: QueryParams = {}): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, String(v));
    } else {
      usp.append(key, String(value));
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

// URLSearchParams -> objeto de paginacao normalizado, com defaults.
export function readPaginationParams(searchParams: URLSearchParams): PageParams {
  const num = (key: string, fallback: number): number => {
    const n = Number(searchParams.get(key));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const rawOrder = (searchParams.get('order') ?? PAGINATION_DEFAULTS.order).toUpperCase();
  const order: SortOrder = rawOrder === 'DESC' ? 'DESC' : 'ASC';
  return {
    page: num('page', PAGINATION_DEFAULTS.page),
    limit: num('limit', PAGINATION_DEFAULTS.limit),
    sort: searchParams.get('sort') || PAGINATION_DEFAULTS.sort,
    order,
  };
}
