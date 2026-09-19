/**
 * =========================================================================
 * FILE HEADER — hooks/useApi.ts
 * =========================================================================
 *
 * PROPOSITO: hook generico de estado de uma chamada assincrona
 * ({ data, error, loading, run, reset, setData }), com abort automatico
 * (cancela a chamada anterior ao rodar de novo e no unmount).
 *
 *   const users = useApi((signal) => userManagerView.getAll({ page: 1 }, { signal }), {
 *     immediate: true,
 *   });
 *
 * DEPENDENCIAS: services/http (ApiError, tipo de erro normalizado).
 * CONSUMIDORES: hooks/useSiteMenu.ts (compoe outro hook em cima) e qualquer
 * pagina/hook que precise chamar um service sem duplicar o boilerplate de
 * loading/error/abort (padrao usado nas paginas de listagem/detalhe de
 * pages/v1/**).
 *
 * COMO REAPROVEITAR: passar uma funcao `(signal) => service.metodo(...)` —
 * o hook cuida de criar o AbortController, popular loading/error/data e
 * abortar a chamada anterior. Usar `immediate: true` para disparar no mount;
 * chamar `run()` manualmente para disparar sob demanda (ex.: botao "Buscar").
 * -------------------------------------------------------------------------
 */

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

/**
 * Roda uma funcao assincrona abortavel e expoe seu estado (data/error/loading).
 * @param fn funcao que recebe um AbortSignal e retorna a Promise da chamada
 * @param options immediate (dispara no mount), onSuccess/onError (callbacks)
 */
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

  /** Aborta a chamada anterior (se houver), dispara `fn` de novo e atualiza data/error/loading. */
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

  /** Aborta qualquer chamada em andamento e limpa data/error/loading para o estado inicial. */
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
