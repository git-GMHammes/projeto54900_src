// Rotas do modulo Service (servico, caracteristicas, pedido e resumo). Montadas em routes/v1/index.tsx (filhas do layout protegido, sem barra inicial).
// Espelha api/v1/service-manager, service-attributes, service-order e service-summary-view. Qualquer usuario autenticado (o backend isola por empresa).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ServiceManagerGetAllPage = lazy(() => import('@/pages/v1/service/service-manager/GetAllPage'));
const ServiceManagerCreatePage = lazy(() => import('@/pages/v1/service/service-manager/CreatePage'));
const ServiceManagerUpdatePage = lazy(() => import('@/pages/v1/service/service-manager/UpdatePage'));
const ServiceManagerGetPage = lazy(() => import('@/pages/v1/service/service-manager/GetPage'));
const ServiceAttributesGetAllPage = lazy(() => import('@/pages/v1/service/service-attributes/GetAllPage'));
const ServiceAttributesCreatePage = lazy(() => import('@/pages/v1/service/service-attributes/CreatePage'));
const ServiceAttributesUpdatePage = lazy(() => import('@/pages/v1/service/service-attributes/UpdatePage'));
const ServiceOrderGetAllPage = lazy(() => import('@/pages/v1/service/service-order/GetAllPage'));
const ServiceOrderCreatePage = lazy(() => import('@/pages/v1/service/service-order/CreatePage'));
const ServiceOrderUpdatePage = lazy(() => import('@/pages/v1/service/service-order/UpdatePage'));
const ServiceOrderGetPage = lazy(() => import('@/pages/v1/service/service-order/GetPage'));
const ServiceSummaryGetAllPage = lazy(() => import('@/pages/v1/service/service-summary/GetAllPage'));
const ServiceSummaryGetPage = lazy(() => import('@/pages/v1/service/service-summary/GetPage'));

export const serviceRoutes: RouteObject[] = [
  { path: 'service-manager', element: <ServiceManagerGetAllPage /> },
  { path: 'service-manager/create', element: <ServiceManagerCreatePage /> },
  { path: 'service-manager/update/:id', element: <ServiceManagerUpdatePage /> },
  { path: 'service-manager/:id', element: <ServiceManagerGetPage /> },
  { path: 'service-attributes', element: <ServiceAttributesGetAllPage /> },
  { path: 'service-attributes/create', element: <ServiceAttributesCreatePage /> },
  { path: 'service-attributes/update/:id', element: <ServiceAttributesUpdatePage /> },
  { path: 'service-order', element: <ServiceOrderGetAllPage /> },
  { path: 'service-order/create', element: <ServiceOrderCreatePage /> },
  { path: 'service-order/update/:id', element: <ServiceOrderUpdatePage /> },
  { path: 'service-order/:id', element: <ServiceOrderGetPage /> },
  { path: 'service-summary', element: <ServiceSummaryGetAllPage /> },
  { path: 'service-summary/:id', element: <ServiceSummaryGetPage /> },
];

export default serviceRoutes;
