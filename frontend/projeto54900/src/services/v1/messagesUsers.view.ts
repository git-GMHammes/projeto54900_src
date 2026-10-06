// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_messages_users (resumo por interlocutor: total, não lidas, última mensagem).
// Espelho de app/Config/Routes/Api/v1/Messages/MessagesUsers/EndPointView.php, grupo
// api/v1/messages-users-view -> Api\V1\Messages\MessagesUsers\ResourceViewController.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messagesUsersView = createResource(API_GROUPS.messagesUsersView, 'v1', { mutations: false });

export default messagesUsersView;
