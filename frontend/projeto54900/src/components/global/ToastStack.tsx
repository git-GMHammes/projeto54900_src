// Pilha visual de toasts (Bootstrap). Controlada pelo ToastProvider.

import type { Toast } from '@/context/ToastContext';

export interface ToastStackProps {
  toasts?: Toast[];
  onDismiss: (id: number) => void;
}

export default function ToastStack({ toasts = [], onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1090 }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show align-items-center text-bg-${t.variant} border-0`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              {t.title && <strong className="d-block">{t.title}</strong>}
              {t.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Fechar"
              onClick={() => {
                onDismiss(t.id);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
