// Espelho de: app/Config/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndpointTable.php
// Grupo: api/v1/chat-rooms-manager -> Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController
//
// Tabela chat_rooms_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomsManagerTable = createResource(API_GROUPS.chatRoomsManager, 'v1');

export default chatRoomsManagerTable;
