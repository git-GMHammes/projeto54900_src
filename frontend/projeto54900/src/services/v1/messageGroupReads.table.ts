// PROPOSITO: recurso REST da tabela message_group_reads (espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupReads/EndpointTable.php, grupo api/v1/message-group-reads) —
// leitura por membro de uma mensagem de grupo. O membro registra a PROPRIA leitura (create idempotente); editar e
// excluir leituras e so do admin. O modo chat nao chama este recurso direto: usa PATCH message-group-messages/chat/{id}/read.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupReadsTable = createResource(API_GROUPS.messageGroupReads, 'v1');

export default messageGroupReadsTable;
