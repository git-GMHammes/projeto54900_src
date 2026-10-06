// PROPOSITO: recurso REST da tabela message_attachments (espelho de
// app/Config/Routes/Api/v1/Messages/MessageAttachments/EndpointTable.php, grupo api/v1/message-attachments).
// Leitura/edicao de metadados/exclusao pelos endpoints padrao; o ENVIO do arquivo (multipart) e o
// serve/download estao em messageAttachments.upload.ts. Quem ve (a mensagem) e quem escreve (remetente
// ou admin) fica no backend.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageAttachmentsTable = createResource(API_GROUPS.messageAttachments, 'v1');

export default messageAttachmentsTable;
