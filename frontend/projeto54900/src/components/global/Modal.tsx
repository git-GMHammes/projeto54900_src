/**
 * =========================================================================
 * FILE HEADER — components/global/Modal.tsx
 * =========================================================================
 *
 * PROPOSITO: modal generico controlado por estado React (mesmo padrao do
 * ConfirmModal: sem depender de `data-bs-*`/instancia JS do Bootstrap,
 * backdrop manual). Sem footer proprio nem botoes prontos — quem usa decide
 * o conteudo (inclusive os botoes de acao) dentro de `children`.
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: qualquer pagina que precise de um modal de conteudo livre
 * (formulario dentro de modal, detalhe expandido, etc.) — para confirmacao
 * simples de sim/nao, preferir ConfirmModal.tsx.
 *
 * COMO REAPROVEITAR: controlar `open` em estado local; usar `size` ('sm' |
 * 'lg' | 'xl') para largura; o corpo (`modal-body`) ja e scrollavel
 * (`modal-dialog-scrollable`).
 * -------------------------------------------------------------------------
 */

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
