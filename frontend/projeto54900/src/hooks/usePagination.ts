/**
 * =========================================================================
 * FILE HEADER — hooks/usePagination.ts
 * =========================================================================
 *
 * PROPOSITO: paginacao no padrao da API (page/limit/sort/order) sincronizada
 * com a querystring da URL (useSearchParams) — a URL e a fonte da verdade,
 * entao refresh/voltar/compartilhar link preservam o estado da listagem.
 *
 *   const { params, setPage, setLimit, toggleSort } = usePagination();
 *   userManagerView.getAll(params);
 *
 * DEPENDENCIAS: utils/querystring (readPaginationParams) e constants/api
 * (PAGINATION_DEFAULTS, usado para omitir da URL o valor que ja e o
 * default).
 * CONSUMIDORES: paginas de listagem (GetAllPage de user/menu/nav/upload,
 * ListConstructorPage) que passam `params` direto para o service de leitura.
 *
 * COMO REAPROVEITAR: chamar usePagination() no topo da pagina, usar `params`
 * na chamada ao service e ligar setPage/setLimit/toggleSort aos controles de
 * paginacao/ordenacao da UI (ver utils/pagination.ts para o calculo da
 * janela de paginas exibida).
 * -------------------------------------------------------------------------
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readPaginationParams } from '@/utils/querystring';
import { PAGINATION_DEFAULTS } from '@/constants/api';
import type { PageParams } from '@/types/api';

export type PaginationPatch = Partial<Record<keyof PageParams, string | number | null | undefined>>;

export interface UsePaginationResult {
  params: PageParams;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleSort: (column: string) => void;
  patch: (next: PaginationPatch) => void;
}

/** Le page/limit/sort/order da URL e expoe setters que gravam de volta na querystring. */
export function usePagination(): UsePaginationResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => readPaginationParams(searchParams), [searchParams]);

  /** Aplica um patch parcial na querystring; remove a chave quando o valor cai no default. */
  const patch = useCallback(
    (next: PaginationPatch) => {
      setSearchParams(
        (prev) => {
          const usp = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(next)) {
            const fallback: string | number = PAGINATION_DEFAULTS[k as keyof PageParams];
            if (v === null || v === undefined || v === '' || v === fallback) {
              usp.delete(k);
            } else {
              usp.set(k, String(v));
            }
          }
          return usp;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  /** Muda so a pagina atual. */
  const setPage = useCallback((page: number) => patch({ page }), [patch]);
  /** Muda o limite por pagina e volta para a pagina 1 (evita pagina "fantasma" fora do range). */
  const setLimit = useCallback((limit: number) => patch({ limit, page: 1 }), [patch]);

  /** Ordena pela coluna clicada; clicar de novo na mesma coluna inverte ASC/DESC. Sempre volta para a pagina 1. */
  const toggleSort = useCallback(
    (column: string) => {
      const sameColumn = params.sort === column;
      patch({
        sort: column,
        order: sameColumn && params.order === 'ASC' ? 'DESC' : 'ASC',
        page: 1,
      });
    },
    [params.sort, params.order, patch],
  );

  return { params, setPage, setLimit, toggleSort, patch };
}
