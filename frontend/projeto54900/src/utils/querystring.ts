/**
 * =========================================================================
 * FILE HEADER — utils/querystring.ts
 * =========================================================================
 *
 * PROPOSITO: montagem/leitura de querystring no padrao da API:
 * ?page=&limit=&sort=&order= (+ quaisquer filtros extras). Centraliza a
 * conversao entre o objeto de parametros usado pelo codigo e a string de
 * URL/URLSearchParams manipulada pelo browser.
 *
 * DEPENDENCIAS: constants/api (PAGINATION_DEFAULTS) e types/api
 * (PageParams, QueryParams, SortOrder).
 * CONSUMIDORES: services/http.ts (toQueryString, monta a URL final de toda
 * chamada GET com filtros/paginacao) e hooks/usePagination.ts
 * (readPaginationParams, hidrata o estado inicial a partir da URL atual).
 *
 * COMO REAPROVEITAR: usar toQueryString(params) para montar a URL de uma
 * chamada GET a partir de um objeto de filtros/paginacao; usar
 * readPaginationParams(new URLSearchParams(location.search)) para
 * recuperar page/limit/sort/order já normalizados (com defaults) ao montar
 * o estado inicial de uma listagem.
 * -------------------------------------------------------------------------
 */

import { PAGINATION_DEFAULTS } from '@/constants/api';
import type { PageParams, QueryParams, SortOrder } from '@/types/api';

/**
 * Serializa um objeto de parametros em querystring, ignorando
 * null/undefined/string vazia; arrays viram chaves repetidas
 * (?tag=a&tag=b).
 * @param params objeto de filtros/paginacao
 * @returns "?a=1&b=2" ou '' se nao houver nenhum parametro valido (sem o "?")
 */
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

/**
 * Le page/limit/sort/order de um URLSearchParams e devolve ja normalizado,
 * caindo em PAGINATION_DEFAULTS para qualquer valor ausente/invalido.
 * @param searchParams tipicamente `new URLSearchParams(location.search)`
 */
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
