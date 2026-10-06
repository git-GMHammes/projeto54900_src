// PROPOSITO: recurso REST da tabela message_warnings (espelho de
// app/Config/Routes/Api/v1/Messages/MessageWarnings/EndpointTable.php, grupo api/v1/message-warnings) —
// advertencia de palavrao. TODO o recurso e so admin (rota adminonly). A advertencia nasce do sistema: o backend
// a registra quando recusa uma mensagem com palavra proibida (App\\Libraries\\ForbiddenWords); aqui o admin edita
// a palavra marcada e exclui.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageWarningsTable = createResource(API_GROUPS.messageWarnings, 'v1');

export default messageWarningsTable;
