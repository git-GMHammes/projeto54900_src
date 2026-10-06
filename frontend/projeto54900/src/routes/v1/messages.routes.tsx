// Rotas do modulo Messages (mensagens diretas — NAO e chat). Montadas em routes/v1/index.tsx
// (filhas do layout protegido, sem barra inicial). Lista, cadastro e edicao de messages-manager e de message-groups-manager (grupos).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const MessagesGetAllPage = lazy(() => import('@/pages/v1/messages/messages-manager/GetAllPage'));
const MessagesCreatePage = lazy(() => import('@/pages/v1/messages/messages-manager/CreatePage'));
const MessagesUpdatePage = lazy(() => import('@/pages/v1/messages/messages-manager/UpdatePage'));
const GroupsGetAllPage = lazy(() => import('@/pages/v1/messages/message-groups-manager/GetAllPage'));
const GroupsCreatePage = lazy(() => import('@/pages/v1/messages/message-groups-manager/CreatePage'));
const GroupsUpdatePage = lazy(() => import('@/pages/v1/messages/message-groups-manager/UpdatePage'));

export const messagesRoutes: RouteObject[] = [
  { path: 'messages-manager', element: <MessagesGetAllPage /> },
  { path: 'messages-manager/create', element: <MessagesCreatePage /> },
  { path: 'messages-manager/update/:id', element: <MessagesUpdatePage /> },
  { path: 'message-groups-manager', element: <GroupsGetAllPage /> },
  { path: 'message-groups-manager/create', element: <GroupsCreatePage /> },
  { path: 'message-groups-manager/update/:id', element: <GroupsUpdatePage /> },
];

export default messagesRoutes;
