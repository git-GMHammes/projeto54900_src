// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_chat_rooms_manager. Espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndPointView.php, grupo
// api/v1/chat-rooms-manager-view -> Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController.
// Para ESCRITA no registro, ver chatRoomsManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomsManagerView = createResource(API_GROUPS.chatRoomsManagerView, 'v1', { mutations: false });

export default chatRoomsManagerView;
