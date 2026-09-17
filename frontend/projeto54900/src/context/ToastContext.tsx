/**
 * =========================================================================
 * FILE HEADER — context/ToastContext.tsx
 * =========================================================================
 *
 * PROPOSITO: fila global de toasts (notificacoes efemeras) — expoe
 * push/success/error/warning/info e renderiza a pilha visual via
 * <ToastStack/> junto do Provider. Cada toast some sozinho apos `delay` ms
 * (dismiss automatico via setTimeout), alem do dismiss manual pelo X.
 *
 * DEPENDENCIAS: components/global/ToastStack (render da pilha visual).
 * CONSUMIDORES: App.tsx monta <ToastProvider> na raiz da arvore; qualquer
 * pagina que faca submit de formulario usa hooks/useToast() para disparar
 * toast.success/error apos a resposta da API (ex.: RegisterPage,
 * FormRendererPage).
 *
 * COMO REAPROVEITAR: chamar useToast() (ver hooks/useToast.ts) e disparar
 * toast.success(msg)/toast.error(msg)/toast.warning(msg)/toast.info(msg);
 * usar push() diretamente so quando precisar de opcoes fora do padrao
 * (title/variant/delay customizados).
 * -------------------------------------------------------------------------
 */

import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import ToastStack from '@/components/global/ToastStack';

export type ToastVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface Toast {
  id: number;
  message: ReactNode;
  title?: string | undefined;
  variant: ToastVariant;
}

export interface ToastOptions {
  title?: string;
  variant?: ToastVariant;
  delay?: number;
}

export interface PushToastInput extends ToastOptions {
  message: ReactNode;
}

export interface ToastApi {
  push: (input: PushToastInput) => number;
  dismiss: (id: number) => void;
  success: (message: ReactNode, opts?: ToastOptions) => number;
  error: (message: ReactNode, opts?: ToastOptions) => number;
  warning: (message: ReactNode, opts?: ToastOptions) => number;
  info: (message: ReactNode, opts?: ToastOptions) => number;
}

export const ToastContext = createContext<ToastApi | null>(null);

let seq = 0;

/** Provider da fila de toasts: guarda a lista em estado e um timer de auto-dismiss por toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  /** Remove um toast da lista e cancela seu timer de auto-dismiss, se ainda pendente. */
  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  /** Adiciona um toast a fila e agenda seu auto-dismiss (delay <= 0 desativa). @returns id do toast criado */
  const push = useCallback(
    ({ message, title, variant = 'primary', delay = 4000 }: PushToastInput): number => {
      const id = ++seq;
      setToasts((list) => [...list, { id, message, title, variant }]);
      if (delay > 0) {
        timers.current.set(
          id,
          setTimeout(() => {
            dismiss(id);
          }, delay),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (message, opts) => push({ message, variant: 'success', ...opts }),
      error: (message, opts) => push({ message, variant: 'danger', delay: 7000, ...opts }),
      warning: (message, opts) => push({ message, variant: 'warning', ...opts }),
      info: (message, opts) => push({ message, variant: 'info', ...opts }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
