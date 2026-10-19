// Rotas do modulo Product (produto e caracteristicas). Montadas em routes/v1/index.tsx (filhas do layout protegido, sem barra inicial).
// Espelha api/v1/product-manager e product-attributes. Qualquer usuario autenticado (o backend isola por empresa).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ProductManagerGetAllPage = lazy(() => import('@/pages/v1/product/product-manager/GetAllPage'));
const ProductManagerCreatePage = lazy(() => import('@/pages/v1/product/product-manager/CreatePage'));
const ProductManagerUpdatePage = lazy(() => import('@/pages/v1/product/product-manager/UpdatePage'));
const ProductManagerGetPage = lazy(() => import('@/pages/v1/product/product-manager/GetPage'));
const ProductAttributesGetAllPage = lazy(() => import('@/pages/v1/product/product-attributes/GetAllPage'));
const ProductAttributesCreatePage = lazy(() => import('@/pages/v1/product/product-attributes/CreatePage'));
const ProductAttributesUpdatePage = lazy(() => import('@/pages/v1/product/product-attributes/UpdatePage'));

export const productRoutes: RouteObject[] = [
  { path: 'product-manager', element: <ProductManagerGetAllPage /> },
  { path: 'product-manager/create', element: <ProductManagerCreatePage /> },
  { path: 'product-manager/update/:id', element: <ProductManagerUpdatePage /> },
  { path: 'product-manager/:id', element: <ProductManagerGetPage /> },
  { path: 'product-attributes', element: <ProductAttributesGetAllPage /> },
  { path: 'product-attributes/create', element: <ProductAttributesCreatePage /> },
  { path: 'product-attributes/update/:id', element: <ProductAttributesUpdatePage /> },
];

export default productRoutes;
