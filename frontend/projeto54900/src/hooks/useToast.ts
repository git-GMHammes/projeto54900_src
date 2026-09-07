import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastApi } from '@/context/ToastContext';

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  }
  return ctx;
}
