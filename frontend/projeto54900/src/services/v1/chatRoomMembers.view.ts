// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_chat_room_members. Espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomMembers/EndPointView.php, grupo
// api/v1/chat-room-members-view -> Api\V1\ChatRooms\ChatRoomMembers\ResourceViewController.
// Para ESCRITA no registro, ver chatRoomMembers.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomMembersView = createResource(API_GROUPS.chatRoomMembersView, 'v1', { mutations: false });

export default chatRoomMembersView;
