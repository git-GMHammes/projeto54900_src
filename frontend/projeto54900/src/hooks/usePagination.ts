// Paginacao no padrao da API (page/limit/sort/order) sincronizada com a URL.
// A URL e a fonte da verdade -> refresh/voltar preservam o estado.
//
//   const { params, setPage, setLimit, toggleSort } = usePagination();
//   userManagerView.getAll(params);

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

export function usePagination(): UsePaginationResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => readPaginationParams(searchParams), [searchParams]);

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

  const setPage = useCallback((page: number) => patch({ page }), [patch]);
  const setLimit = useCallback((limit: number) => patch({ limit, page: 1 }), [patch]);

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
