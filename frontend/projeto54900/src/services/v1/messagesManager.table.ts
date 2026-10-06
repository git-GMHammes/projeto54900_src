// PROPOSITO: recurso REST da tabela messages_manager (espelho de
// app/Config/Routes/Api/v1/Messages/MessagesManager/EndpointTable.php, grupo api/v1/messages-manager).
// Leitura/escrita pelos endpoints padrão; a regra de quem vê e quem altera fica no backend
// (remetente, destinatário só o já enviado, admin). Message NÃO é chat.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messagesManagerTable = createResource(API_GROUPS.messagesManager, 'v1');

export default messagesManagerTable;
