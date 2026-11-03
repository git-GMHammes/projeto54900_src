/**
 * FILE HEADER — routes/v1/sgd.routes.tsx
 *
 * O QUE FAZ: rotas do módulo SGD (Sistema Gerenciador de Documentos), paths
 * relativos ao pai "/v1". Só telas: o backend (tabela/API) ainda não existe.
 *
 * MAPA DAS ROTAS:
 *   sgd            -> GetAllPage  lista (ListBuild 'sgd') com busca e ações
 *   sgd/create     -> CreatePage  cadastro (form 'criar-sgd', um campo de upload)
 *   sgd/update/:id -> UpdatePage  edição (form 'editar-sgd')
 *   sgd/:id        -> GetPage     visualização
 *
 * REGRAS: `path` relativo (sem "/" inicial); manter `routes/paths.ts`
 * (`paths.v1.sgd`) em sincronia. Docs: `README_modulo_sgd.md`.
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/sgd/GetAllPage'));
const CreatePage = lazy(() => import('@/pages/v1/sgd/CreatePage'));
const UpdatePage = lazy(() => import('@/pages/v1/sgd/UpdatePage'));
const GetPage = lazy(() => import('@/pages/v1/sgd/GetPage'));

export const sgdRoutes: RouteObject[] = [
  { path: 'sgd', element: <GetAllPage /> },
  { path: 'sgd/create', element: <CreatePage /> },
  { path: 'sgd/update/:id', element: <UpdatePage /> },
  { path: 'sgd/:id', element: <GetPage /> },
];

export default sgdRoutes;
