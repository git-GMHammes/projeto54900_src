// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_chat_messages. Espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatMessages/EndPointView.php, grupo
// api/v1/chat-messages-view -> Api\V1\ChatRooms\ChatMessages\ResourceViewController.
// Para ESCRITA no registro, ver chatMessages.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatMessagesView = createResource(API_GROUPS.chatMessagesView, 'v1', { mutations: false });

export default chatMessagesView;
