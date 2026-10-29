/**
 * =========================================================================
 * FILE HEADER — hooks/useNavScroll.ts
 * =========================================================================
 *
 * PROPOSITO: rolagem horizontal por setas da lista do nav quando os itens passam
 * da largura (Template002 e Template003, a partir de `lg`).
 *
 *   const { ref, overflow, atStart, atEnd, scrollNav } = useNavScroll(navOpen);
 *
 * - `ref` vai na lista (`ul`) que tem `overflow-x-hidden` e itens sem quebra.
 * - `overflow` diz se o conteudo passa da largura (as setas so aparecem entao).
 * - `atStart` e `atEnd` desabilitam a seta da ponta onde a lista ja chegou.
 * - `scrollNav('next')` desliza a lista para a esquerda (mostra os itens do fim);
 *   `scrollNav('prev')` desliza para a direita.
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: pages/Template002/Template002Page.tsx, pages/Template003/Template003Page.tsx.
 *
 * COMO REAPROVEITAR: `active` deve ser `false` quando a lista nao esta montada
 * (ex.: nav fechado), para o hook medir de novo quando ela voltar.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface NavScrollState {
  overflow: boolean;
  atStart: boolean;
  atEnd: boolean;
}

/** Fração da largura visível percorrida a cada clique numa seta. */
const SCROLL_STEP = 0.75;

export function useNavScroll(active = true) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<NavScrollState>({ overflow: false, atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next: NavScrollState = { overflow: max > 1, atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft >= max - 1 };
    setState((prev) =>
      prev.overflow === next.overflow && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [active, measure]);

  const scrollNav = useCallback((direction: 'prev' | 'next') => {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * SCROLL_STEP * (direction === 'next' ? 1 : -1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  return { ref, ...state, scrollNav };
}
