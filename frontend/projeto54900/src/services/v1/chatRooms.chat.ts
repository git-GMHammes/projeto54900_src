// PROPOSITO: endpoints da TELA DE CHAT (sala aberta pelo botão Entrar) que não
// são CRUD padrão: entrar na sala, ler as mensagens da sala e listar os favoritos
// do usuário. Espelho de:
//   - ChatRoomsManager: POST join/{id}            (Routes/.../ChatRoomsManager/EndpointCustom.php)
//   - ChatMessages:     GET  room/{roomId}        (Routes/.../ChatMessages/EndpointCustom.php)
//   - ChatRoomFavorites: GET mine                 (Routes/.../ChatRoomFavorites/EndpointCustom.php)
// Envio de mensagem e upload usam chatMessages.table.ts e chatRoomAttachments.upload.ts.

import { http } from '@/services/http';

export interface RoomAttachment {
  id: number;
  /** 'blocked' = denunciado: membro comum recebe só o aviso (sem nome, categoria nem tamanho). */
  status: 'active' | 'blocked';
  name: string;
  category: string;
  size: number;
}

export interface RoomMention {
  user_manager_id: number;
  name: string;
}

export interface RoomMessage {
  id: number;
  content: string;
  user_manager_id: number;
  author: string;
  created_at: string;
  attachments: RoomAttachment[];
  mentions: RoomMention[];
}

/** Membro ativo da sala (para o @). membership_id é o que o envio de mensagem recebe em mentions. */
export interface RoomMember {
  membership_id: number;
  user_manager_id: number;
  name: string;
}

export interface RoomMessagesPayload {
  items: RoomMessage[];
  count: number;
  members: RoomMember[];
}

export interface FavoriteRoom {
  chat_rooms_manager_id: number;
  name: string;
  status: 'open' | 'closed';
}

export interface FavoritesPayload {
  items: FavoriteRoom[];
  limit: number;
  count: number;
}

/** Entra na sala (membro ativo). Idempotente. */
export function joinRoom(roomId: number | string): Promise<unknown> {
  return http.post(`/v1/chat-rooms-manager/join/${roomId}`);
}

/** Mensagens enviadas da sala (exige membro ativo ou admin). */
export function listRoomMessages(roomId: number | string, signal?: AbortSignal): Promise<RoomMessagesPayload> {
  return http.get<{ data: RoomMessagesPayload }>(`/v1/chat-messages/room/${roomId}`, { signal }).then((r) => r.data);
}

/** Favoritos do usuário da sessão e o limite vigente. */
export function myFavorites(signal?: AbortSignal): Promise<FavoritesPayload> {
  return http.get<{ data: FavoritesPayload }>('/v1/chat-room-favorites/mine', { signal }).then((r) => r.data);
}
