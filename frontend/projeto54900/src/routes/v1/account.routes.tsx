// Rotas do modulo Account (v1) — self-service do proprio usuario logado,
// acessado pelo dropdown da Navbar (icone + username). Paths relativos ao
// pai "/v1". Sem espelho de grupo unico no backend: profile fala com
// user-profiles/me + update, security fala com auth/change-password.
// Ambas protegidas por <RequireAuth/> (ver routes/v1/index.tsx).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ProfileUpdatePage = lazy(() => import('@/pages/v1/account/profile/UpdatePage'));
const SecurityUpdatePage = lazy(() => import('@/pages/v1/account/security/UpdatePage'));

export const accountRoutes: RouteObject[] = [
  { path: 'account/profile', element: <ProfileUpdatePage /> },
  { path: 'account/security', element: <SecurityUpdatePage /> },
];

export default accountRoutes;
