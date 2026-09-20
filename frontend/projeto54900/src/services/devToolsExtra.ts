/**
 * =========================================================================
 * FILE HEADER — services/devToolsExtra.ts
 * =========================================================================
 *
 * PROPOSITO: store externo (fora do React, mesmo padrao de
 * services/apiDebugLog.ts) para uma pagina registrar UM botao/elemento extra
 * a ser renderizado ao lado do DEBUG dentro de ApiDebugPanel.tsx, sem que o
 * painel precise conhecer qual pagina o registrou.
 *
 * Guarda no maximo um registrante por vez (ultimo registrado vence) — o caso
 * de uso e sempre "a tela aberta agora tem um botao dev-only extra".
 *
 * DEPENDENCIAS: nenhuma (so tipos de react para o ReactNode).
 * CONSUMIDORES: components/global/ApiDebugPanel.tsx (le via
 * hooks/useDevToolsExtra.ts) e qualquer pagina que registre (ex.:
 * pages/v1/user/user-manager/PasswordHashPreviewButton.tsx).
 *
 * COMO REAPROVEITAR: chamar setExtra(node) num useEffect ao montar a pagina
 * e devolver () => clearExtra() na limpeza do efeito, para o botao sumir ao
 * sair da tela.
 * -------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';

let extra: ReactNode = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function setExtra(node: ReactNode): void {
  extra = node;
  notify();
}

export function clearExtra(): void {
  extra = null;
  notify();
}

export function getExtra(): ReactNode {
  return extra;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
