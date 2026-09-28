/**
 * =========================================================================
 * FILE HEADER — hooks/useBootstrapTooltips.ts
 * =========================================================================
 *
 * PROPOSITO: inicializar/destruir instancias de `bootstrap.Tooltip` para
 * todo elemento `[data-bs-toggle="tooltip"]` dentro de um container. O
 * bundle JS do Bootstrap (com Popper) ja e importado globalmente em
 * `bootstrap.ts`, mas Tooltip/Popover sao opt-in — nao inicializam sozinhos
 * so por causa do atributo `data-bs-toggle`.
 *
 * IMPORT DO Tooltip: SEMPRE do MESMO ARQUIVO ja carregado por `bootstrap.ts`
 * (`bootstrap/dist/js/bootstrap.bundle.min.js`), NUNCA do especificador
 * generico `'bootstrap'` (resolve pra `bootstrap.esm.js`, um SEGUNDO arquivo,
 * com sua PROPRIA copia de Dropdown/EventHandler/Data). As duas copias
 * coexistindo faziam o dropdown do menu abrir e fechar no mesmo clique (bug
 * real ja corrigido — ver `types/vendor.d.ts` pro motivo completo).
 *
 * DEPENDENCIAS: `bootstrap/dist/js/bootstrap.bundle.min.js` (classe `Tooltip`).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (botoes de
 * Curtir/Comentar/Denunciar). Generico — qualquer container com botoes
 * `title` + `data-bs-toggle="tooltip"` pode reaproveitar.
 *
 * COMO REAPROVEITAR: `const ref = useBootstrapTooltips<HTMLDivElement>();`
 * e passar `ref={ref}` no elemento que envolve os botoes com tooltip.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';
import { Tooltip } from 'bootstrap/dist/js/bootstrap.bundle.min.js';

export function useBootstrapTooltips<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]'));
    const instances = nodes.map((el) => new Tooltip(el));

    return () => {
      instances.forEach((instance) => instance.dispose());
    };
    // Roda so no mount/unmount do container - os botoes com tooltip (Curtir/Comentar/
    // Denunciar) e seus titulos sao fixos, recriar a cada render descartaria um tooltip aberto.
  }, []);

  return ref;
}

export default useBootstrapTooltips;
