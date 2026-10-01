// Espelho de: app/Config/Routes/Api/v1/ChatRooms/ChatMessages/EndpointTable.php
// Grupo: api/v1/chat-messages -> Api\V1\ChatRooms\ChatMessages\ResourceTableController
//
// Tabela chat_messages (leitura + escrita + soft/hard delete). O update so
// aceita status=removed (UpdateRequest) — conteudo e imutavel apos o create.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const chatMessagesTable = createResource(API_GROUPS.chatMessages, 'v1');

export default chatMessagesTable;
