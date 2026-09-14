// Raiz da aplicacao: providers globais + RouterProvider.
// Suspense cobre o carregamento das paginas lazy (routes/v1/*).

import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes';
import { AppConfigProvider } from '@/context/AppConfigContext';
import { ToastProvider } from '@/context/ToastContext';
import LoadingOverlay from '@/components/global/LoadingOverlay';

export default function App() {
  return (
    <AppConfigProvider>
      <ToastProvider>
        <Suspense fallback={<LoadingOverlay />}>
          <RouterProvider router={router} />
        </Suspense>
      </ToastProvider>
    </AppConfigProvider>
  );
}
