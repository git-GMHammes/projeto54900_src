// Spinner. `overlay` cobre o container relativo mais proximo; senao renderiza inline.

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
