// Subrotas do modulo Calendar (v1). Paths relativos ao pai "v1".
// Espelha api/v1/calendar-manager(-view).
//
// - /v1/calendar-manager -> CalendarManagerGetAllPage: lista calendarios com
//                           seus eventos (view_calendar_manager, agrupada no
//                           cliente por calendario) + criacao via modal.
//                           SEM redirect — rota propria (ver
//                           src/markdown/geral/modulos/calendar/README_calendar.md).
//
// - /v1/convite/aceitar -> AceitarConvitePage: destino do link de e-mail do
//                          convite de evento (token na querystring). PUBLICA
//                          (sem sessao) — exportada separada em
//                          calendarInvitePublicRoutes, registrada FORA do
//                          <RequireAuth/> em routes/v1/index.tsx, mesmo padrao
//                          de userPublicRoutes/userProtectedRoutes.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const CalendarManagerGetAllPage = lazy(() => import('@/pages/v1/calendar/calendar-manager/GetAllPage'));
const AceitarConvitePage = lazy(() => import('@/pages/v1/calendar/calendar-event-invites/AceitarConvitePage'));

export const calendarRoutes: RouteObject[] = [
  { path: 'calendar-manager', element: <CalendarManagerGetAllPage /> },
];

export const calendarInvitePublicRoutes: RouteObject[] = [
  { path: 'convite/aceitar', element: <AceitarConvitePage /> },
];

export default calendarRoutes;
