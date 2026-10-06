// PROPOSITO: recurso REST da tabela message_group_messages (espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupMessages/EndpointTable.php, grupo api/v1/message-group-messages).
// O `create` envia a mensagem a um grupo (mensagem + ligacao numa transacao); o id deste recurso e o da
// LIGACAO mensagem-grupo. Quem edita/exclui (remetente ou admin) e quem ve (membros ativos so o ja enviado)
// fica no backend.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupMessagesTable = createResource(API_GROUPS.messageGroupMessages, 'v1');

export default messageGroupMessagesTable;
