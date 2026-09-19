/**
 * =========================================================================
 * FILE HEADER — components/global/LoadingOverlay.tsx
 * =========================================================================
 *
 * PROPOSITO: spinner de carregamento. `overlay=true` cobre o container
 * `position: relative` mais proximo (precisa de um ancestral relativo/
 * absolute para posicionar corretamente); `overlay=false` (default)
 * renderiza inline, centralizado, ocupando o espaco do proprio fluxo.
 *
 * DEPENDENCIAS: nenhuma.
 * CONSUMIDORES: praticamente toda pagina com carregamento assincrono (ex.:
 * RegisterPage, paginas de listagem/detalhe) durante o loading inicial.
 *
 * COMO REAPROVEITAR: usar sem `overlay` para o loading de pagina inteira
 * (substitui o conteudo); usar `overlay` quando precisar cobrir so uma
 * secao (ex.: recarregando uma lista que ja tem conteudo visivel atras).
 * -------------------------------------------------------------------------
 */

export interface LoadingOverlayProps {
  overlay?: boolean;
  label?: string;
}

export default function LoadingOverlay({ overlay = false, label = 'Carregando…' }: LoadingOverlayProps) {
  const spinner = (
    <div className="d-flex align-items-center gap-2 text-body-secondary">
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );

  if (!overlay) return <div className="py-4 d-flex justify-content-center">{spinner}</div>;

  return (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-body bg-opacity-75"
      style={{ zIndex: 5 }}
    >
      {spinner}
    </div>
  );
}
