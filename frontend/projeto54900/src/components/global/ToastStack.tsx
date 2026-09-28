/**
 * =========================================================================
 * FILE HEADER — components/global/ToastStack.tsx
 * =========================================================================
 *
 * PROPOSITO: pilha visual de toasts (Bootstrap `.toast-container`), so
 * apresentacao — nao tem estado proprio, so renderiza a lista recebida e
 * delega o fechamento (`onDismiss`) para quem a controla.
 *
 * POSICIONAMENTO: `top: 5.5rem` (em vez de `top-0`) — mesmo offset do botao
 * flutuante de `pages/v1/timeline/home-feed/GetAllPage.tsx`, usado pra ficar
 * ABAIXO da navbar. Com `top-0` e `zIndex: 1090` (maior que o `zIndex:1000`
 * do dropdown do Bootstrap), o container ficava por cima do canto superior
 * direito da navbar sempre que havia toast na tela, bloqueando o clique nos
 * dropdowns do menu (mais perceptivel na Timeline, unica tela onde toasts
 * disparam em sequencia: curtir/avaliar/comentar).
 *
 * DEPENDENCIAS: context/ToastContext (tipo Toast).
 * CONSUMIDORES: context/ToastContext.tsx renderiza <ToastStack> dentro do
 * <ToastProvider>, passando a lista de toasts e dismiss(); nenhuma pagina
 * usa este componente diretamente (usar hooks/useToast() para disparar
 * toasts, nunca montar outro <ToastStack>).
 *
 * COMO REAPROVEITAR: nao instanciar diretamente — disparar toasts via
 * hooks/useToast() (toast.success/error/...), que ja aparecem nesta pilha
 * unica montada pelo Provider.
 * -------------------------------------------------------------------------
 */

import type { Toast } from '@/context/ToastContext';

export interface ToastStackProps {
  toasts?: Toast[];
  onDismiss: (id: number) => void;
}

export default function ToastStack({ toasts = [], onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed end-0 p-3"
      style={{ zIndex: 1090, top: '5.5rem' }}
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
