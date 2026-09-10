// Modal controlado por React (não pelo bundle JS do Bootstrap): usa as classes
// `.modal` / `.modal-backdrop` e um portal para o <body>. Fecha em Esc, no
// clique fora do diálogo e no × / Concluir. Trava o scroll do body enquanto
// aberto. Motivo de não usar o plugin JS: o React é dono desta subárvore e o
// Bootstrap movendo/limpando esses nós conflita com o render.

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface FormModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Com `onSave` o rodapé passa a "Salvar" + "Fechar"; sem ele mantém "Concluir". */
  onSave?: () => void;
  saving?: boolean;
  saveError?: string | null;
  saveDisabled?: boolean;
  saveLabel?: string;
}

export default function FormModal({
  title,
  onClose,
  children,
  onSave,
  saving = false,
  saveError = null,
  saveDisabled = false,
  saveLabel = 'Salvar',
}: FormModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return createPortal(
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          ref={dialogRef}
          tabIndex={-1}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {saveError ? (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {saveError}
                </div>
              ) : null}
              {children}
            </div>
            <div className="modal-footer">
              {onSave ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onSave}
                    disabled={saving || saveDisabled}
                  >
                    {saving ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                    ) : null}
                    {saveLabel}
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
