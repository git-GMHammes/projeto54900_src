// Subrotas do modulo Usuarios (v1). Paths relativos ao pai "v1".
// Espelha api/v1/user-manager (+ -view). Estrutura de paginas por recurso/acao:
// pages/v1/user/user-manager/{CreatePage,UpdatePage,GetAllPage,GetPage}.tsx.
// O fluxo composto (login + perfil, 2 tabelas) fica em pages/v1/user/register/.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/user/user-manager/GetAllPage'));
const GetPage = lazy(() => import('@/pages/v1/user/user-manager/GetPage'));
const CreatePage = lazy(() => import('@/pages/v1/user/user-manager/CreatePage'));
const UpdatePage = lazy(() => import('@/pages/v1/user/user-manager/UpdatePage'));
const RegisterPage = lazy(() => import('@/pages/v1/user/register/RegisterPage'));

export const userRoutes: RouteObject[] = [
  { path: 'user-manager', element: <GetAllPage /> },
  { path: 'user-manager/create', element: <CreatePage /> },
  { path: 'user-manager/:id', element: <GetPage /> },
  { path: 'user-manager/:id/update', element: <UpdatePage /> },
  { path: 'register', element: <RegisterPage /> },
];

export default userRoutes;
