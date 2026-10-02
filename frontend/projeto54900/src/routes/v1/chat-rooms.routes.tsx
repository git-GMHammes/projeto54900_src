// Rotas do modulo ChatRooms (v1), paths relativos ao pai "/v1". Espelha
// api/v1/chat-room-members(-view) (membros das salas),
// api/v1/chat-room-attachments(-view) (anexos das mensagens),
// api/v1/chat-rooms-manager(-view) e api/v1/chat-messages(-view). Demais
// recursos (chat-room-attachments, chat-room-attachment-reports,
// chat-room-warnings, chat-room-favorites) entram em rodadas seguintes.
//
// MAPA DAS ROTAS:
//   chat-rooms-manager            -> GetAllPage  lista as salas (list-constructor)
//   chat-rooms-manager/create     -> CreatePage  build 'criar-sala-chat'
//   chat-rooms-manager/update/:id -> UpdatePage  build 'editar-sala-chat'
//   chat-messages                 -> GetAllPage  lista as mensagens (list-constructor)
//   chat-messages/create          -> CreatePage  build 'enviar-mensagem'
//     (sem update/:id: UpdateRequest do backend so aceita status=removed —
//      vira acao "Remover" na lista, nao tela de edicao)
//   chat-room-members             -> GetAllPage  lista os membros (list-constructor)
//   chat-room-members/create      -> CreatePage  build 'criar-membro-sala'
//   chat-room-members/update/:id  -> UpdatePage  build 'editar-membro-sala'
//     (escrita so do dono da sala ou admin — Processor)
//   chat-room-attachments             -> GetAllPage  lista os anexos (list-constructor; acao Baixar)
//   chat-room-attachments/create      -> CreatePage  build 'enviar-anexo-chat' (upload multipart)
//   chat-room-attachments/update/:id  -> UpdatePage  build 'editar-anexo-chat' (status/categoria)
//
// Sem RequireRole: qualquer usuario logado (nao guest) pode criar/ver salas
// e mensagens — o backend (Processor) restringe update/close/remove ao dono,
// autor ou admin.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const RoomsGetAllPage = lazy(() => import('@/pages/v1/chat-rooms/chat-rooms-manager/GetAllPage'));
const RoomsCreatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-rooms-manager/CreatePage'));
const RoomsUpdatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-rooms-manager/UpdatePage'));
const MessagesGetAllPage = lazy(() => import('@/pages/v1/chat-rooms/chat-messages/GetAllPage'));
const MessagesCreatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-messages/CreatePage'));
const MembersGetAllPage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-members/GetAllPage'));
const MembersCreatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-members/CreatePage'));
const MembersUpdatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-members/UpdatePage'));
const AttachmentsGetAllPage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-attachments/GetAllPage'));
const AttachmentsCreatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-attachments/CreatePage'));
const AttachmentsUpdatePage = lazy(() => import('@/pages/v1/chat-rooms/chat-room-attachments/UpdatePage'));

export const chatRoomsRoutes: RouteObject[] = [
  { path: 'chat-rooms-manager', element: <RoomsGetAllPage /> },
  { path: 'chat-rooms-manager/create', element: <RoomsCreatePage /> },
  { path: 'chat-rooms-manager/update/:id', element: <RoomsUpdatePage /> },
  { path: 'chat-messages', element: <MessagesGetAllPage /> },
  { path: 'chat-messages/create', element: <MessagesCreatePage /> },
  { path: 'chat-room-members', element: <MembersGetAllPage /> },
  { path: 'chat-room-members/create', element: <MembersCreatePage /> },
  { path: 'chat-room-members/update/:id', element: <MembersUpdatePage /> },
  { path: 'chat-room-attachments', element: <AttachmentsGetAllPage /> },
  { path: 'chat-room-attachments/create', element: <AttachmentsCreatePage /> },
  { path: 'chat-room-attachments/update/:id', element: <AttachmentsUpdatePage /> },
];

export default chatRoomsRoutes;
