/**
 * =========================================================================
 * FILE HEADER — hooks/useDevToolsExtra.ts
 * =========================================================================
 *
 * PROPOSITO: assina o store externo de services/devToolsExtra.ts
 * (useSyncExternalStore, mesmo padrao de hooks/useApiDebugLog.ts) e reexpoe
 * o elemento extra registrado pela pagina aberta, para renderizar ao lado
 * do DEBUG.
 *
 * DEPENDENCIAS: services/devToolsExtra (getExtra, subscribe).
 * CONSUMIDORES: components/global/ApiDebugPanel.tsx (unico consumidor).
 * -------------------------------------------------------------------------
 */

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { getExtra, subscribe } from '@/services/devToolsExtra';

/** Elemento extra registrado pela pagina aberta, ou null se nenhuma registrou. */
export function useDevToolsExtra(): ReactNode {
  return useSyncExternalStore(subscribe, getExtra, getExtra);
}
