// Rotas do modulo Movement (movimento de produto e saldo). Montadas em routes/v1/index.tsx (filhas do layout protegido, sem barra inicial).
// Espelha api/v1/movement-manager e movement-stock-view. Qualquer usuario autenticado (o backend isola por empresa).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const MovementManagerGetAllPage = lazy(() => import('@/pages/v1/movement/movement-manager/GetAllPage'));
const MovementManagerCreatePage = lazy(() => import('@/pages/v1/movement/movement-manager/CreatePage'));
const MovementManagerUpdatePage = lazy(() => import('@/pages/v1/movement/movement-manager/UpdatePage'));
const MovementManagerGetPage = lazy(() => import('@/pages/v1/movement/movement-manager/GetPage'));
const MovementStockGetAllPage = lazy(() => import('@/pages/v1/movement/movement-stock/GetAllPage'));
const MovementStockGetPage = lazy(() => import('@/pages/v1/movement/movement-stock/GetPage'));

export const movementRoutes: RouteObject[] = [
  { path: 'movement-manager', element: <MovementManagerGetAllPage /> },
  { path: 'movement-manager/create', element: <MovementManagerCreatePage /> },
  { path: 'movement-manager/update/:id', element: <MovementManagerUpdatePage /> },
  { path: 'movement-manager/:id', element: <MovementManagerGetPage /> },
  { path: 'movement-stock', element: <MovementStockGetAllPage /> },
  { path: 'movement-stock/:id', element: <MovementStockGetPage /> },
];

export default movementRoutes;
