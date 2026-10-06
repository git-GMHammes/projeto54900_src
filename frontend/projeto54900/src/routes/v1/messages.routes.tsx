// Rotas do modulo Messages (mensagens diretas — NAO e chat). Montadas em routes/v1/index.tsx
// (filhas do layout protegido, sem barra inicial). Lista, cadastro e edicao de messages-manager e de message-groups-manager (grupos); lista e tela de membros (grupos <-> usuarios) em message-group-members-manager (o cadastro e um modal da lista).

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import RequireRole from '@/routes/RequireRole';

const MessagesGetAllPage = lazy(() => import('@/pages/v1/messages/messages-manager/GetAllPage'));
const MessagesCreatePage = lazy(() => import('@/pages/v1/messages/messages-manager/CreatePage'));
const MessagesUpdatePage = lazy(() => import('@/pages/v1/messages/messages-manager/UpdatePage'));
const GroupsGetAllPage = lazy(() => import('@/pages/v1/messages/message-groups-manager/GetAllPage'));
const GroupsCreatePage = lazy(() => import('@/pages/v1/messages/message-groups-manager/CreatePage'));
const GroupsUpdatePage = lazy(() => import('@/pages/v1/messages/message-groups-manager/UpdatePage'));
const GroupMembersGetAllPage = lazy(() => import('@/pages/v1/messages/message-group-members-manager/GetAllPage'));
const GroupMembersUpdatePage = lazy(() => import('@/pages/v1/messages/message-group-members-manager/UpdatePage'));
const GroupMessagesGetAllPage = lazy(() => import('@/pages/v1/messages/message-group-messages-manager/GetAllPage'));
const GroupMessagesCreatePage = lazy(() => import('@/pages/v1/messages/message-group-messages-manager/CreatePage'));
const GroupMessagesUpdatePage = lazy(() => import('@/pages/v1/messages/message-group-messages-manager/UpdatePage'));
const AttachmentsGetAllPage = lazy(() => import('@/pages/v1/messages/message-attachments-manager/GetAllPage'));
const ChatHomePage = lazy(() => import('@/pages/v1/messages/chat/ChatHomePage'));
const WarningsGetAllPage = lazy(() => import('@/pages/v1/messages/message-warnings-manager/GetAllPage'));
const WarningsUpdatePage = lazy(() => import('@/pages/v1/messages/message-warnings-manager/UpdatePage'));

// As telas ADMINISTRATIVAS (lista, grupos, membros, mensagens de grupo, anexos e advertencias) so valem para o papel `admin`
// (RequireRole) e nao tem relacao com "Conversas" (`message-chat`, o chat), que e para qualquer usuario logado. A API segue aberta
// ao usuario comum porque o chat depende dela.
export const messagesRoutes: RouteObject[] = [
  { path: 'message-chat', element: <ChatHomePage /> },
  {
    element: <RequireRole role="admin" />,
    children: [
      { path: 'messages-manager', element: <MessagesGetAllPage /> },
      { path: 'messages-manager/create', element: <MessagesCreatePage /> },
      { path: 'messages-manager/update/:id', element: <MessagesUpdatePage /> },
      { path: 'message-groups-manager', element: <GroupsGetAllPage /> },
      { path: 'message-groups-manager/create', element: <GroupsCreatePage /> },
      { path: 'message-groups-manager/update/:id', element: <GroupsUpdatePage /> },
      { path: 'message-group-members-manager', element: <GroupMembersGetAllPage /> },
      { path: 'message-group-members-manager/update/:id', element: <GroupMembersUpdatePage /> },
      { path: 'message-group-messages-manager', element: <GroupMessagesGetAllPage /> },
      { path: 'message-group-messages-manager/create', element: <GroupMessagesCreatePage /> },
      { path: 'message-group-messages-manager/update/:id', element: <GroupMessagesUpdatePage /> },
      { path: 'message-attachments-manager', element: <AttachmentsGetAllPage /> },
      { path: 'message-warnings-manager', element: <WarningsGetAllPage /> },
      { path: 'message-warnings-manager/update/:id', element: <WarningsUpdatePage /> },
    ],
  },
];

export default messagesRoutes;
