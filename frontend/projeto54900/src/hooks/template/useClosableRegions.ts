/**
 * =========================================================================
 * FILE HEADER — hooks/template/useClosableRegions.ts
 * =========================================================================
 *
 * PROPOSITO: efeito de SAIDA dos componentes do template (fechar regiao pelo X). COPIA da logica
 * que os templates estaticos (pages/Template00X/Template00XPage.tsx) trazem dentro da pagina:
 * fechar em duas etapas — `closing` dispara a animacao (classe `tpl-closing`, em
 * styles/_template-global.scss) e, passado CLOSE_ANIMATION_MS, `closed` retira a regiao da tela.
 * Sem desfazer: o estado fica so em memoria (recarregar restaura).
 *
 *   const { isOpen, close, collapsibleClass, isClosing } = useClosableRegions<'header' | 'nav' | 'footer'>();
 *   {isOpen('header') && <div className={collapsibleClass('header')}>...</div>}
 *
 * DEPENDENCIAS: nenhuma. A duracao precisa coincidir com `.tpl-collapsible` (0,35 s) no SCSS.
 * CONSUMIDORES: layout real do template (migracao em andamento).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Duracao da animacao de fechar (ms); precisa coincidir com `.tpl-collapsible` em _template-global.scss. */
export const CLOSE_ANIMATION_MS = 350;

export function useClosableRegions<S extends string>() {
  const [closing, setClosing] = useState<ReadonlySet<S>>(new Set());
  const [closed, setClosed] = useState<ReadonlySet<S>>(new Set());
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const close = useCallback((section: S) => {
    setClosing((prev) => new Set(prev).add(section));
    timers.current.push(window.setTimeout(() => setClosed((prev) => new Set(prev).add(section)), CLOSE_ANIMATION_MS));
  }, []);

  const isOpen = useCallback((section: S) => !closed.has(section), [closed]);
  const isClosing = useCallback((section: S) => closing.has(section), [closing]);
  const collapsibleClass = useCallback(
    (section: S) => `tpl-collapsible ${closing.has(section) ? 'tpl-closing' : ''}`,
    [closing],
  );

  return { close, isOpen, isClosing, collapsibleClass };
}
