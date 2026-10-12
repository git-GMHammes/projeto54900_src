/**
 * =========================================================================
 * FILE HEADER — hooks/useMapLinks.ts
 * =========================================================================
 *
 * PROPOSITO: carrega os vinculos de mapa (CEP, endereco, ponto, rota) de UM
 * registro de QUALQUER modulo, por `module` + `referenceId` (+ `collection`
 * opcional), lendo view_map_links (filtros exatos via `filters[...]`).
 *
 * RETORNO: { links, loading, error, reload, remove }. `remove` faz exclusao
 * logica (delete-soft) do vinculo e recarrega a lista.
 *
 * DEPENDENCIAS: services/v1 (mapLinksView, mapLinksTable), utils/apiResult,
 * utils/mapLinks (errorText). CONSUMIDOR: components/map/MapLinksPanel.tsx.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';

import { mapLinksTable, mapLinksView } from '@/services/v1';
import type { PaginationInput } from '@/types/api';
import type { MapLinkViewRow } from '@/types/map';
import { normalizeList } from '@/utils/apiResult';
import { errorText } from '@/utils/mapLinks';

export interface UseMapLinksArgs {
  module: string;
  referenceId: number | string;
  /** Papel do vinculo (ex.: 'origin', 'travel'). Omitido = todos os papeis do registro. */
  collection?: string | undefined;
}

export interface UseMapLinksResult {
  links: MapLinkViewRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  remove: (id: number | string) => Promise<void>;
}

export function useMapLinks({ module, referenceId, collection }: UseMapLinksArgs): UseMapLinksResult {
  const [links, setLinks] = useState<MapLinkViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params: PaginationInput = {
      'filters[ml_module]': module,
      'filters[ml_reference_id]': String(referenceId),
      'filters[ml_status]': 'active',
      limit: 200,
      sort: 'ml_sort_order',
      order: 'ASC',
    };
    if (collection) params['filters[ml_collection]'] = collection;

    mapLinksView
      .search('', params, { signal: controller.signal })
      .then((payload) => {
        setLinks(normalizeList<MapLinkViewRow>(payload).rows);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(errorText(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [module, referenceId, collection, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const remove = useCallback(
    async (id: number | string) => {
      await mapLinksTable.deleteSoft(id);
      setTick((t) => t + 1);
    },
    [],
  );

  return { links, loading, error, reload, remove };
}

export default useMapLinks;
