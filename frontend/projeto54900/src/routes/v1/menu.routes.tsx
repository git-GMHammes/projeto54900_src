// Subrotas do modulo Menu (v1). Paths relativos ao pai "v1".
// Espelha api/v1/menu-manager (arvore de itens navegaveis, ligada a um nav-manager).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/menu/GetAllPage'));
const CreatePage = lazy(() => import('@/pages/v1/menu/CreatePage'));
const GetPage = lazy(() => import('@/pages/v1/menu/GetPage'));
const UpdatePage = lazy(() => import('@/pages/v1/menu/UpdatePage'));

export const menuRoutes: RouteObject[] = [
  { path: 'menu-manager', element: <GetAllPage /> },
  { path: 'menu-manager/create', element: <CreatePage /> },
  { path: 'menu-manager/:id', element: <GetPage /> },
  { path: 'menu-manager/update/:id', element: <UpdatePage /> },
];

export default menuRoutes;
