// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_attachments.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageAttachments/EndPointView.php, grupo
// api/v1/message-attachments-view -> Api\V1\Messages\MessageAttachments\ResourceViewController.
// Cada linha traz o anexo, a mensagem, o tipo da conversa (private/group), o destino e o remetente.
// Para ESCRITA, ver messageAttachments.table.ts / messageAttachments.upload.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageAttachmentsView = createResource(API_GROUPS.messageAttachmentsView, 'v1', { mutations: false });

export default messageAttachmentsView;
