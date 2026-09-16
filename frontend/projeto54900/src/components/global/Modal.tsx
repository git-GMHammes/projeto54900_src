// Modal generico controlado por estado React (mesmo padrao do ConfirmModal:
// sem depender da instancia JS do Bootstrap, backdrop manual). Sem footer
// proprio — quem usa decide os botoes dentro do children.

import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
  size?: 'sm' | 'lg' | 'xl';
}

export default function Modal({ open, title, onClose, children, size }: ModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size ? `modal-${size}` : ''}`}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
