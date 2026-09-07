// Subrotas do modulo Uploads (v1). Paths relativos ao pai "v1".
// Espelha api/v1/upload-manager (+ -view).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UploadListPage = lazy(() => import('@/pages/v1/upload/UploadListPage'));
const UploadViewPage = lazy(() => import('@/pages/v1/upload/UploadViewPage'));

export const uploadRoutes: RouteObject[] = [
  { path: 'upload-manager', element: <UploadListPage /> },
  { path: 'upload-manager/:id', element: <UploadViewPage /> },
];

export default uploadRoutes;
