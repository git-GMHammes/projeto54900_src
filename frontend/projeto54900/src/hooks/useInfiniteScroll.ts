/**
 * =========================================================================
 * FILE HEADER — hooks/useInfiniteScroll.ts
 * =========================================================================
 *
 * PROPOSITO: hook GLOBAL de scroll infinito — devolve uma `ref` para uma
 * "sentinela" (`<div>` vazia no fim da lista); quando ela entra na área
 * visível (ou perto dela, via `rootMargin`), chama `onIntersect` uma vez. Não
 * conhece paginação, endpoint nem formato de dado — só "avisa quando chegou
 * perto do fim", a página decide o que fazer (carregar mais 10, mais
 * comentários, etc.).
 *
 *   const sentinelRef = useInfiniteScroll(loadMore, { enabled: hasMore && !loading });
 *   ...
 *   <div ref={sentinelRef} />
 *
 * DEPENDÊNCIAS: `IntersectionObserver` nativo do navegador (sem polyfill —
 * suportado por todos os navegadores que o projeto já alveja).
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx` (scroll infinito
 * do feed, 10 em 10) e `PostCard.tsx` (scroll infinito dos comentários, ao
 * abrir "ver mais"). Primeiro hook de scroll infinito do projeto — qualquer
 * lista futura que precisar do mesmo comportamento reaproveita este arquivo,
 * não deve escrever um `IntersectionObserver` próprio.
 *
 * DETALHES DE MANUTENÇÃO:
 *   1. `onIntersect` fica numa `ref` interna (`onIntersectRef`) para o
 *      observer não precisar ser recriado a cada render só porque o
 *      consumidor passou uma função nova (closure) — só `enabled`/`rootMargin`
 *      recriam o observer.
 *   2. `enabled=false` desconecta o observer (nenhuma chamada some
 *      "perdida" — quando voltar a `true`, reobserva a mesma sentinela).
 *   3. O cleanup (`observer.disconnect()`) roda tanto no unmount quanto toda
 *      vez que as dependências mudam — evita observer duplicado.
 *
 * COMO REAPROVEITAR: anexe a `ref` devolvida a um elemento no FIM da lista
 * renderizada (depois do último item) e passe `enabled: hasMore && !loading`
 * para não disparar `onIntersect` de novo enquanto a chamada anterior ainda
 * está em voo, nem depois que a lista acabou.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  /** Quando `false`, o observer fica desligado (ex.: já carregando, ou não há mais páginas). Default `true`. */
  enabled?: boolean;
  /** Distância da viewport em que a sentinela já dispara `onIntersect` (antecipa o carregamento). Default `'200px'`. */
  rootMargin?: string;
}

/** Ref para anexar a uma sentinela no fim de uma lista — chama `onIntersect` quando ela entra na área visível (ou perto). */
export function useInfiniteScroll(
  onIntersect: () => void,
  { enabled = true, rootMargin = '200px' }: UseInfiniteScrollOptions = {},
): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}

export default useInfiniteScroll;
