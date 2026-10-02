// Espelho de: app/Config/Routes/Api/v1/ChatRooms/ChatRoomMembers/EndpointTable.php
// Grupo: api/v1/chat-room-members -> Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController
//
// Tabela chat_room_members (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomMembersTable = createResource(API_GROUPS.chatRoomMembers, 'v1');

export default chatRoomMembersTable;
