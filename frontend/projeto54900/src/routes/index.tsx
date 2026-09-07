// Arvore de rotas do app (data router).
// - basename: prefixo publico (env.basePath) -> casa com o location do nginx.
// - RootLayout envolve tudo; erros caem em RouteErrorPage.
// - Cada versao de API tem seu bloco: v1Routes, v1aRoutes, ...

import { createBrowserRouter } from 'react-router-dom';
import { routerBasename } from '@/config/env';

import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/Home/HomePage';
import RouteErrorPage from '@/pages/errors/RouteErrorPage';
import NotFoundPage from '@/pages/errors/NotFoundPage';

import { v1Routes } from '@/routes/v1';
import { v1aRoutes } from '@/routes/v1a';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        v1Routes,
        v1aRoutes,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: routerBasename },
);

export default router;
