// PROPOSITO: recurso REST da tabela chat_room_favorites (espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomFavorites/EndpointTable.php, grupo api/v1/chat-room-favorites).
// Leitura/escrita pelos endpoints padrão; a regra de quem pode escrever fica no backend.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomFavoritesTable = createResource(API_GROUPS.chatRoomFavorites, 'v1');

export default chatRoomFavoritesTable;
