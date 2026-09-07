// Estado de uma chamada assincrona: { data, error, loading, run, reset, setData }.
//
//   const users = useApi((signal) => userManagerView.getAll({ page: 1 }, { signal }), {
//     immediate: true,
//   });
//
// - `run()` cria um AbortController novo e passa o signal para a fn.
// - aborta a requisicao anterior ao refazer e no unmount.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ApiError } from '@/services/http';

export type ApiFetcher<T> = (signal: AbortSignal) => Promise<T>;

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (result: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  run: () => Promise<T | undefined>;
  reset: () => void;
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useApi<T>(
  fn: ApiFetcher<T>,
  { immediate = false, onSuccess, onError }: UseApiOptions<T> = {},
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const fnRef = useRef(fn);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(async (): Promise<T | undefined> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(controller.signal);
      if (controller.signal.aborted) return undefined;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return undefined;
      const normalized =
        err instanceof ApiError
          ? err
          : new ApiError(err instanceof Error ? err.message : 'Erro inesperado.');
      setError(normalized);
      onError?.(normalized);
      return undefined;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) void run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, loading, run, reset, setData };
}
