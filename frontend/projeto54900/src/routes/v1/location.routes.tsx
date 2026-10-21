// Rotas do modulo Location (locais em arvore recursiva e tipos). Montadas em routes/v1/index.tsx
// (filhas do layout protegido, sem barra inicial). Espelha api/v1/location-manager e location-types.
// Locais: qualquer usuario autenticado (o backend isola por empresa). Tipos: so admin.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import RequireRole from '@/routes/RequireRole';

const LocationManagerGetAllPage = lazy(() => import('@/pages/v1/location/location-manager/GetAllPage'));
const LocationManagerCreatePage = lazy(() => import('@/pages/v1/location/location-manager/CreatePage'));
const LocationManagerUpdatePage = lazy(() => import('@/pages/v1/location/location-manager/UpdatePage'));
const LocationManagerGetPage = lazy(() => import('@/pages/v1/location/location-manager/GetPage'));
const LocationTypesGetAllPage = lazy(() => import('@/pages/v1/location/location-types/GetAllPage'));
const LocationTypesCreatePage = lazy(() => import('@/pages/v1/location/location-types/CreatePage'));
const LocationTypesUpdatePage = lazy(() => import('@/pages/v1/location/location-types/UpdatePage'));

export const locationRoutes: RouteObject[] = [
  { path: 'location-manager', element: <LocationManagerGetAllPage /> },
  { path: 'location-manager/create', element: <LocationManagerCreatePage /> },
  { path: 'location-manager/update/:id', element: <LocationManagerUpdatePage /> },
  { path: 'location-manager/:id', element: <LocationManagerGetPage /> },
  {
    element: <RequireRole role="admin" />,
    children: [
      { path: 'location-types', element: <LocationTypesGetAllPage /> },
      { path: 'location-types/create', element: <LocationTypesCreatePage /> },
      { path: 'location-types/update/:id', element: <LocationTypesUpdatePage /> },
    ],
  },
];

export default locationRoutes;
