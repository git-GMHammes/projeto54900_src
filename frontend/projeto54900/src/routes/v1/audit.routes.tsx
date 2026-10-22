// Rotas do modulo Audit (log de auditoria e acesso). Montadas em routes/v1/index.tsx
// (filhas do layout protegido, sem barra inicial). Espelha api/v1/audit-logs.
// Tela administrativa: so papel `admin` (RequireRole); o backend tambem restringe (adminonly).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import RequireRole from '@/routes/RequireRole';

const AuditLogsGetAllPage = lazy(() => import('@/pages/v1/audit/audit-logs/GetAllPage'));

export const auditRoutes: RouteObject[] = [
  {
    element: <RequireRole role="admin" />,
    children: [{ path: 'audit-logs', element: <AuditLogsGetAllPage /> }],
  },
];

export default auditRoutes;
