// Modal de confirmacao controlado por estado React (sem data-bs-*).
// Renderiza o backdrop manualmente para nao depender da instancia JS do Bootstrap.

import type { ReactNode } from 'react';

export interface ConfirmModalProps {
  open: boolean;
  title?: ReactNode;
  message?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: string;
  busy?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

export default function ConfirmModal({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
            </div>
            <div className="modal-body">
              {typeof message === 'string' ? <p className="mb-0">{message}</p> : message}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={busy}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn btn-${variant}`}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
