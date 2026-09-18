/**
 * =========================================================================
 * FILE HEADER — hooks/useApiDebugLog.ts
 * =========================================================================
 *
 * PROPOSITO: assina o store externo de services/apiDebugLog.ts
 * (useSyncExternalStore, sem estado React duplicado) e reexpoe as entradas
 * capturadas de cada resposta de API, mais o access_token mais recente
 * (decodificado via utils/jwt.ts dentro do proprio service) — dev-only.
 *
 * DEPENDENCIAS: services/apiDebugLog (getEntries, getLatestToken, subscribe
 * e os tipos ApiDebugEntry/LatestToken).
 * CONSUMIDORES: components/global/ApiDebugPanel.tsx (unico consumidor —
 * so renderiza em host de desenvolvimento, ver config/envHost.ts).
 *
 * COMO REAPROVEITAR: usar useApiDebugLog() para listar as chamadas capturadas
 * e useLatestAccessToken() para exibir o token mais recente decodificado;
 * ambos re-renderizam automaticamente a cada nova entrada do store.
 * -------------------------------------------------------------------------
 */

import { useSyncExternalStore } from 'react';
import { getEntries, getLatestToken, subscribe, type ApiDebugEntry, type LatestToken } from '@/services/apiDebugLog';

/** Lista reativa das entradas de debug capturadas (mais recente por ultimo). */
export function useApiDebugLog(): ApiDebugEntry[] {
  return useSyncExternalStore(subscribe, getEntries, getEntries);
}

/** access_token mais recente capturado, ja decodificado (header+payload), ou null se nenhum ainda. */
export function useLatestAccessToken(): LatestToken | null {
  return useSyncExternalStore(subscribe, getLatestToken, getLatestToken);
}
