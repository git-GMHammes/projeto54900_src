/**
 * =========================================================================
 * FILE HEADER — hooks/template/useScrolled.ts
 * =========================================================================
 *
 * COPIA GLOBAL de hooks/useScrolled.ts (que continua servindo os templates estaticos, sem alteracao).
 * PROPOSITO: informa se a pagina foi rolada alem de um limite, para trocar o
 * visual de uma barra fixa (ex.: nav do Template001 encolhe e ganha sombra).
 *
 *   const scrolled = useScrolled(16);
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido).
 * CONSUMIDORES: layout real do template (migracao em andamento).
 *
 * COMO REAPROVEITAR: usar o booleano para alternar classes; o listener e
 * passivo e removido ao desmontar.
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';

/** `true` quando `window.scrollY` passa de `threshold` pixels. */
export function useScrolled(threshold = 16): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
