// Versao v1a — espelha o namespace Api\V1A do backend.
// Stub: ainda sem modulos. Ao criar o primeiro grupo em api/v1a no CodeIgniter,
// replicar aqui o mesmo padrao de user.routes.tsx / upload.routes.tsx e adicionar
// os services correspondentes em services/v1a/.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const VersionPlaceholderPage = lazy(() => import('@/pages/errors/VersionPlaceholderPage'));

export const v1aRoutes: RouteObject = {
  path: 'v1a',
  children: [{ index: true, element: <VersionPlaceholderPage version="v1a" /> }],
};

export default v1aRoutes;
