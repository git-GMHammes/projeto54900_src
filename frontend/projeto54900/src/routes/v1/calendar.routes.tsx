// Subrotas do modulo Calendar (v1). Paths relativos ao pai "v1".
// Espelha api/v1/calendar-manager(-view).
//
// - /v1/calendar-manager -> CalendarManagerGetAllPage: lista calendarios com
//                           seus eventos (view_calendar_manager, agrupada no
//                           cliente por calendario) + criacao via modal.
//                           SEM redirect — rota propria (ver
//                           src/markdown/geral/modulos/calendar/README_calendar.md).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const CalendarManagerGetAllPage = lazy(() => import('@/pages/v1/calendar/calendar-manager/GetAllPage'));

export const calendarRoutes: RouteObject[] = [
  { path: 'calendar-manager', element: <CalendarManagerGetAllPage /> },
];

export default calendarRoutes;
