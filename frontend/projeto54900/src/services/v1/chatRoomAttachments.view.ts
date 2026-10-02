// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_chat_room_attachments. Espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndPointView.php, grupo
// api/v1/chat-room-attachments-view -> Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController.
// Para ESCRITA no registro, ver chatRoomAttachments.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomAttachmentsView = createResource(API_GROUPS.chatRoomAttachmentsView, 'v1', { mutations: false });

export default chatRoomAttachmentsView;
