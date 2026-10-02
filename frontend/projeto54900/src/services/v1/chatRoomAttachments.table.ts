// Espelho de: app/Config/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndpointTable.php
// Grupo: api/v1/chat-room-attachments -> Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController
//
// Tabela chat_room_attachments (leitura + escrita + soft/hard delete). O
// `create` e multipart (upload) — usar chatRoomAttachments.upload.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatRoomAttachmentsTable = createResource(API_GROUPS.chatRoomAttachments, 'v1');

export default chatRoomAttachmentsTable;
