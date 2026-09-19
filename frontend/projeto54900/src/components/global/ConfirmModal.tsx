/**
 * =========================================================================
 * FILE HEADER — components/global/ConfirmModal.tsx
 * =========================================================================
 *
 * PROPOSITO: modal de confirmacao (ex.: "excluir este registro?") controlado
 * por estado React (`open`), sem depender de `data-bs-*`/instancia JS do
 * Bootstrap — renderiza o backdrop manualmente. Diferente de Modal.tsx
 * (generico, sem footer proprio), este ja tem os 2 botoes (cancelar/
 * confirmar) prontos.
 *
 * DEPENDENCIAS: nenhuma (so tipos de react).
 * CONSUMIDORES: qualquer pagina de listagem/detalhe que precise confirmar
 * uma acao destrutiva antes de chamar a API (ex.: excluir um registro).
 *
 * COMO REAPROVEITAR: controlar `open` em estado local, passar `onConfirm`
 * (chama o service de delete) e `onClose`; usar `busy` para desabilitar os
 * botoes e mostrar spinner enquanto a chamada esta em andamento.
 * -------------------------------------------------------------------------
 */

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
