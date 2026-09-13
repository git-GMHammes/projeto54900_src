// Subrotas do modulo Nav (v1). Paths relativos ao pai "v1".
// Espelha api/v1/nav-manager. Config/branding do app/navbar.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/nav/GetAllPage'));
const CreatePage = lazy(() => import('@/pages/v1/nav/CreatePage'));
const GetPage = lazy(() => import('@/pages/v1/nav/GetPage'));
const UpdatePage = lazy(() => import('@/pages/v1/nav/UpdatePage'));

export const navRoutes: RouteObject[] = [
  { path: 'nav-manager', element: <GetAllPage /> },
  { path: 'nav-manager/create', element: <CreatePage /> },
  { path: 'nav-manager/:id', element: <GetPage /> },
  { path: 'nav-manager/:id/update', element: <UpdatePage /> },
];

export default navRoutes;
