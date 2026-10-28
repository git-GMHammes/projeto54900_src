// Botao X pequeno e discreto (meia opacidade), no canto superior direito da regiao mais proxima com
// `position-relative`. COPIA GLOBAL do CloseButton que os templates estaticos trazem dentro da pagina
// (pages/Template00X/Template00XPage.tsx, que continuam intactos). Herda a cor da letra da regiao.
// Usado com hooks/template/useClosableRegions.ts.

export interface CloseButtonProps {
  label: string;
  onClose: () => void;
  className?: string;
}

export default function CloseButton({ label, onClose, className = '' }: CloseButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-sm border-0 px-1 py-0 lh-1 text-body opacity-50 position-absolute top-0 end-0 m-1 z-1 ${className}`}
      aria-label={label}
      title={label}
      onClick={onClose}
    >
      <i className="bi bi-x small" />
    </button>
  );
}
