// Subrota do modulo Auth (v1). Espelha api/v1/auth (so login tem pagina —
// refresh/logout/me sao chamados pelo AuthContext, sem tela propria).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const LoginPage = lazy(() => import('@/pages/v1/auth/LoginPage'));

export const authRoutes: RouteObject[] = [{ path: 'login', element: <LoginPage /> }];

export default authRoutes;
