// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_group_posts.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageGroupMessages/EndPointView.php, grupo
// api/v1/message-group-messages-view -> Api\V1\Messages\MessageGroupMessages\ResourceViewController.
// Para ESCRITA, ver messageGroupMessages.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupMessagesView = createResource(API_GROUPS.messageGroupMessagesView, 'v1', { mutations: false });

export default messageGroupMessagesView;
