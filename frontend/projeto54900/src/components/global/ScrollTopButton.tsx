/**
 * =========================================================================
 * FILE HEADER — components/global/ScrollTopButton.tsx
 * =========================================================================
 *
 * PROPOSITO: botao flutuante redondo (seta para cima), canto inferior
 * direito, que volta a pagina ao topo com rolagem suave. Fica invisivel
 * enquanto a janela esta perto do topo e aparece depois de `threshold`
 * pixels rolados.
 *
 * DEPENDENCIAS: nenhuma (so `window` + classes Bootstrap / Bootstrap Icons).
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx` (feed com
 * scroll infinito, pedido do usuario em 2026-09-28).
 *
 * COMO REAPROVEITAR: em qualquer pagina de lista longa, renderizar
 * `<ScrollTopButton />` uma vez no JSX — o botao e `position-fixed`, nao
 * depende de onde e colocado.
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';

export interface ScrollTopButtonProps {
  /** Pixels rolados a partir dos quais o botao aparece. */
  threshold?: number;
}

export default function ScrollTopButton({ threshold = 400 }: ScrollTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="btn btn-secondary rounded-circle shadow position-fixed d-flex align-items-center justify-content-center p-0"
      style={{ bottom: '1.5rem', right: '1.5rem', width: '2.75rem', height: '2.75rem', zIndex: 1030 }}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="bi bi-arrow-up fs-5" />
    </button>
  );
}
