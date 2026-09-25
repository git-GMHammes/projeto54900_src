/**
 * =========================================================================
 * FILE HEADER — routes/index.tsx
 * =========================================================================
 *
 * O QUE FAZ: monta a arvore de rotas raiz do app com createBrowserRouter
 * (data router do react-router-dom). RootLayout (navbar + footer) envolve
 * todas as rotas filhas; qualquer excecao lancada por loader/render de uma
 * rota cai em RouteErrorPage (renderizado fora do RootLayout, dentro de
 * BlankLayout - sem navbar). "*" pega qualquer path nao casado.
 * basename = routerBasename (env.basePath) - prefixo publico que casa com
 * o location configurado no nginx.
 * Cada versao de API do backend tem seu proprio bloco de rotas
 * (v1Routes, v1aRoutes, ...), registrado como filho de "/".
 *
 * DEPENDENCIAS (arquivos proprios do projeto):
 *   - layouts/RootLayout: casca visual (navbar + footer) das rotas normais.
 *   - pages/Home/HomePage: pagina indice ("/").
 *   - pages/errors/RouteErrorPage: elemento de erro da arvore.
 *   - pages/errors/NotFoundPage: pagina do path "*".
 *   - routes/v1 (v1Routes) e routes/v1a (v1aRoutes): blocos de rota por
 *     versao de API, cada um espelhando o grupo correspondente do backend
 *     (app/Config/Routes.php).
 *   - config/env (routerBasename): prefixo de URL publico.
 *
 * CONSUMIDORES: App.tsx importa `router` e o passa para
 * `<RouterProvider router={router} />`.
 *
 * COMO ADICIONAR UMA NOVA VERSAO DE API (ex.: v1b):
 *   1. Criar routes/v1b/index.tsx seguindo o mesmo padrao de routes/v1/index.tsx
 *      (agregando os *.routes.tsx dos modulos daquela versao).
 *   2. Importar `v1bRoutes` aqui e adicionar como mais um item do array
 *      `children`, ao lado de v1Routes/v1aRoutes.
 *   3. Atualizar README_rotas_frontend.md com a nova secao.
 * -------------------------------------------------------------------------
 */

import { createBrowserRouter } from 'react-router-dom';
import { routerBasename } from '@/config/env';

import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/Home/HomePage';
import RouteErrorPage from '@/pages/errors/RouteErrorPage';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';

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
        { path: 'acesso-negado', element: <ForbiddenPage /> },
        v1Routes,
        v1aRoutes,
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: routerBasename },
);

export default router;
