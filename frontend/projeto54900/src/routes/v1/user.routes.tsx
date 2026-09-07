// Subrotas do modulo Usuarios (v1). Paths relativos ao pai "v1".
// Espelha api/v1/user-manager (+ -view).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UserListPage = lazy(() => import('@/pages/v1/user/UserListPage'));
const UserViewPage = lazy(() => import('@/pages/v1/user/UserViewPage'));
const UserFormPage = lazy(() => import('@/pages/v1/user/UserFormPage'));

export const userRoutes: RouteObject[] = [
  { path: 'user-manager', element: <UserListPage /> },
  { path: 'user-manager/novo', element: <UserFormPage mode="create" /> },
  { path: 'user-manager/:id', element: <UserViewPage /> },
  { path: 'user-manager/:id/editar', element: <UserFormPage mode="edit" /> },
];

export default userRoutes;
