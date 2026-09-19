/**
 * =========================================================================
 * FILE HEADER — hooks/useToast.ts
 * =========================================================================
 *
 * PROPOSITO: hook de consumo do ToastContext — atalho para disparar
 * toast.success/error/warning/info sem importar o Context direto.
 *
 * DEPENDENCIAS: context/ToastContext (ToastContext, tipo ToastApi).
 * CONSUMIDORES: praticamente toda pagina com submit de formulario ou acao
 * assincrona (RegisterPage, FormRendererPage, paginas de CRUD) usa
 * useToast() para dar feedback de sucesso/erro ao usuario.
 *
 * COMO REAPROVEITAR: chamar useToast() dentro de qualquer componente
 * descendente de <ToastProvider> (montado em App.tsx) e usar
 * toast.success(msg)/toast.error(msg, { title }).
 * -------------------------------------------------------------------------
 */

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastApi } from '@/context/ToastContext';

/** Hook de consumo — lanca erro se usado fora de <ToastProvider>. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  }
  return ctx;
}
