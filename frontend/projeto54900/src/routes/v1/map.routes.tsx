// Subrotas do modulo Map (v1). Paths relativos ao pai "v1" (sem barra inicial).
// Sob <RequireAuth/> (routes/v1/index.tsx); o backend tambem exige jwtauth em todas as APIs map-*.
//
// - /v1/map                           -> ExplorerPage: escolher mapa, pontos, busca de endereco/CEP e trajeto
// - /v1/map/links/:module/:id         -> LinksPage: mapa de UM registro de qualquer modulo
//                                        (modulo registrado em Config/MapLinkables.php no backend)
//
// - /v1/map-manager, /v1/map-icons, ... -> administrativo dos 10 recursos (RequireRole admin):
//   lista, cadastro e edicao pelos builders do banco (ListBuild/RecordFormBuild).
//
// Paginas lazy: o Leaflet so carrega quando uma destas telas e aberta.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import RequireRole from '@/routes/RequireRole';

const ExplorerPage = lazy(() => import('@/pages/v1/map/explorer/ExplorerPage'));
const LinksPage = lazy(() => import('@/pages/v1/map/links/LinksPage'));

// Administrativo (so admin; o backend tambem restringe a exclusao definitiva)
const ManagerGetAll = lazy(() => import('@/pages/v1/map/map-manager/GetAllPage'));
const ManagerCreate = lazy(() => import('@/pages/v1/map/map-manager/CreatePage'));
const ManagerUpdate = lazy(() => import('@/pages/v1/map/map-manager/UpdatePage'));
const IconsGetAll = lazy(() => import('@/pages/v1/map/map-icons/GetAllPage'));
const IconsCreate = lazy(() => import('@/pages/v1/map/map-icons/CreatePage'));
const IconsUpdate = lazy(() => import('@/pages/v1/map/map-icons/UpdatePage'));
const CategoriesGetAll = lazy(() => import('@/pages/v1/map/map-categories/GetAllPage'));
const CategoriesCreate = lazy(() => import('@/pages/v1/map/map-categories/CreatePage'));
const CategoriesUpdate = lazy(() => import('@/pages/v1/map/map-categories/UpdatePage'));
const PostalCodesGetAll = lazy(() => import('@/pages/v1/map/map-postal-codes/GetAllPage'));
const PostalCodesCreate = lazy(() => import('@/pages/v1/map/map-postal-codes/CreatePage'));
const PostalCodesUpdate = lazy(() => import('@/pages/v1/map/map-postal-codes/UpdatePage'));
const AddressesGetAll = lazy(() => import('@/pages/v1/map/map-addresses/GetAllPage'));
const AddressesCreate = lazy(() => import('@/pages/v1/map/map-addresses/CreatePage'));
const AddressesUpdate = lazy(() => import('@/pages/v1/map/map-addresses/UpdatePage'));
const PointsGetAll = lazy(() => import('@/pages/v1/map/map-points/GetAllPage'));
const PointsCreate = lazy(() => import('@/pages/v1/map/map-points/CreatePage'));
const PointsUpdate = lazy(() => import('@/pages/v1/map/map-points/UpdatePage'));
const RoutesGetAll = lazy(() => import('@/pages/v1/map/map-routes/GetAllPage'));
const RoutesUpdate = lazy(() => import('@/pages/v1/map/map-routes/UpdatePage'));
const RouteStopsGetAll = lazy(() => import('@/pages/v1/map/map-route-stops/GetAllPage'));
const RouteStopsCreate = lazy(() => import('@/pages/v1/map/map-route-stops/CreatePage'));
const RouteStopsUpdate = lazy(() => import('@/pages/v1/map/map-route-stops/UpdatePage'));
const LinksGetAll = lazy(() => import('@/pages/v1/map/map-links/GetAllPage'));
const LinksCreate = lazy(() => import('@/pages/v1/map/map-links/CreatePage'));
const LinksUpdate = lazy(() => import('@/pages/v1/map/map-links/UpdatePage'));
const GeocodeCacheGetAll = lazy(() => import('@/pages/v1/map/map-geocode-cache/GetAllPage'));

export const mapRoutes: RouteObject[] = [
  { path: 'map', element: <ExplorerPage /> },
  { path: 'map/links/:module/:id', element: <LinksPage /> },
  {
    element: <RequireRole role="admin" />,
    children: [
      { path: 'map-manager', element: <ManagerGetAll /> },
      { path: 'map-manager/create', element: <ManagerCreate /> },
      { path: 'map-manager/update/:id', element: <ManagerUpdate /> },
      { path: 'map-icons', element: <IconsGetAll /> },
      { path: 'map-icons/create', element: <IconsCreate /> },
      { path: 'map-icons/update/:id', element: <IconsUpdate /> },
      { path: 'map-categories', element: <CategoriesGetAll /> },
      { path: 'map-categories/create', element: <CategoriesCreate /> },
      { path: 'map-categories/update/:id', element: <CategoriesUpdate /> },
      { path: 'map-postal-codes', element: <PostalCodesGetAll /> },
      { path: 'map-postal-codes/create', element: <PostalCodesCreate /> },
      { path: 'map-postal-codes/update/:id', element: <PostalCodesUpdate /> },
      { path: 'map-addresses', element: <AddressesGetAll /> },
      { path: 'map-addresses/create', element: <AddressesCreate /> },
      { path: 'map-addresses/update/:id', element: <AddressesUpdate /> },
      { path: 'map-points', element: <PointsGetAll /> },
      { path: 'map-points/create', element: <PointsCreate /> },
      { path: 'map-points/update/:id', element: <PointsUpdate /> },
      { path: 'map-routes', element: <RoutesGetAll /> },
      { path: 'map-routes/update/:id', element: <RoutesUpdate /> },
      { path: 'map-route-stops', element: <RouteStopsGetAll /> },
      { path: 'map-route-stops/create', element: <RouteStopsCreate /> },
      { path: 'map-route-stops/update/:id', element: <RouteStopsUpdate /> },
      { path: 'map-links', element: <LinksGetAll /> },
      { path: 'map-links/create', element: <LinksCreate /> },
      { path: 'map-links/update/:id', element: <LinksUpdate /> },
      { path: 'map-geocode-cache', element: <GeocodeCacheGetAll /> },
    ],
  },
];

export default mapRoutes;
