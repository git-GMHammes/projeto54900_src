/**
 * =========================================================================
 * FILE HEADER — hooks/template/useReveal.ts
 * =========================================================================
 *
 * COPIA GLOBAL de hooks/useReveal.ts (que continua servindo os templates estaticos, sem alteracao).
 * PROPOSITO: revela blocos quando entram na tela ao rolar. Observa, dentro do
 * elemento que recebe o `ref`, todo descendente com a classe `tpl-reveal` ou
 * `tpl-reveal-group` e adiciona `tpl-in` ao primeiro cruzamento com a tela. O
 * movimento em si e CSS (styles/_template-global.scss, escopo .tpl-app).
 *
 *   const rootRef = useReveal<HTMLDivElement>();
 *   <div ref={rootRef}>...<div className="tpl-reveal">...</div></div>
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido). Sem `IntersectionObserver`, os
 * blocos sao revelados na hora.
 * CONSUMIDORES: layout real do template (migracao em andamento).
 *
 * COMO REAPROVEITAR: o efeito roda uma vez na montagem; blocos inseridos depois
 * nao sao observados.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const REVEAL_CLASS = 'tpl-in';

export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>('.tpl-reveal, .tpl-reveal-group');

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add(REVEAL_CLASS));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(REVEAL_CLASS);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return rootRef;
}
