// Agrupa todas as subrotas da versao v1 sob o prefixo "/v1".
// Espelha o grupo api/v1 do backend (app/Config/Routes.php).

import { redirect } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { uploadRoutes } from './upload.routes';
import { formRoutes } from './form.routes';
import { listRoutes } from './list.routes';
import { navRoutes } from './nav.routes';
import { menuRoutes } from './menu.routes';

export const v1Routes: RouteObject = {
  path: 'v1',
  children: [
    // /v1  -> redireciona para a primeira listagem util
    { index: true, loader: () => redirect(paths.v1.user.list) },
    ...authRoutes,
    ...userRoutes,
    ...uploadRoutes,
    ...formRoutes,
    ...listRoutes,
    ...navRoutes,
    ...menuRoutes,
  ],
};

export default v1Routes;
