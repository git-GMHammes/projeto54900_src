// PROPOSITO: recurso REST da tabela chat_room_warnings (espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomWarnings/EndpointTable.php, grupo api/v1/chat-room-warnings).
// Leitura/escrita pelos endpoints padrão; a regra de quem pode escrever fica no backend.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomWarningsTable = createResource(API_GROUPS.chatRoomWarnings, 'v1');

export default chatRoomWarningsTable;
