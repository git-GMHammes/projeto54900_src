// Rotas do modulo Company (cadastro de empresas). Montadas em routes/v1/index.tsx
// (filhas do layout protegido, sem barra inicial). Espelha api/v1/company-manager (+ -view).
// Telas administrativas: so papel `superuser` (RequireRole; nem admin acessa); o backend tambem restringe a escrita.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import RequireRole from '@/routes/RequireRole';

const CompanyManagerGetAllPage = lazy(() => import('@/pages/v1/company/company-manager/GetAllPage'));
const CompanyManagerCreatePage = lazy(() => import('@/pages/v1/company/company-manager/CreatePage'));
const CompanyManagerUpdatePage = lazy(() => import('@/pages/v1/company/company-manager/UpdatePage'));
const MembersGetAllPage = lazy(() => import('@/pages/v1/company/company-members/GetAllPage'));
const MembersUpdatePage = lazy(() => import('@/pages/v1/company/company-members/UpdatePage'));
const UsersGetAllPage = lazy(() => import('@/pages/v1/company/company-users/GetAllPage'));

export const companyRoutes: RouteObject[] = [
  {
    element: <RequireRole role="superuser" />,
    children: [
      { path: 'company-manager', element: <CompanyManagerGetAllPage /> },
      { path: 'company-manager/create', element: <CompanyManagerCreatePage /> },
      { path: 'company-manager/update/:id', element: <CompanyManagerUpdatePage /> },
      { path: 'company-members', element: <MembersGetAllPage /> },
      { path: 'company-members/update/:id', element: <MembersUpdatePage /> },
      { path: 'company-users', element: <UsersGetAllPage /> },
    ],
  },
];

export default companyRoutes;
