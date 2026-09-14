// Assina o store de src/services/apiDebugLog.ts e reexpõe as entradas
// capturadas de cada resposta de API (dev-only).

import { useSyncExternalStore } from 'react';
import { getEntries, getLatestToken, subscribe, type ApiDebugEntry, type LatestToken } from '@/services/apiDebugLog';

export function useApiDebugLog(): ApiDebugEntry[] {
  return useSyncExternalStore(subscribe, getEntries, getEntries);
}

export function useLatestAccessToken(): LatestToken | null {
  return useSyncExternalStore(subscribe, getLatestToken, getLatestToken);
}
