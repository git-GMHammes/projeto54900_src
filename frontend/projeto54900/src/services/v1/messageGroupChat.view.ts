// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_group_chat_summary — uma
// linha por (membro, grupo) com `mgcs_unread_count` e a ultima mensagem do grupo. Espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupChat/EndPointView.php, grupo api/v1/message-group-chat-view.
// Escopada no backend: cada usuario ve so as proprias linhas. Alimenta o badge e a ordem dos grupos no modo chat.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupChatView = createResource(API_GROUPS.messageGroupChatView, 'v1', { mutations: false });

export default messageGroupChatView;
