// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_group_reads (leitura +
// mensagem + grupo + leitor, sem dados pessoais sensiveis). Espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupReads/EndPointView.php, grupo api/v1/message-group-reads-view.
// Escrita: messageGroupReads.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupReadsView = createResource(API_GROUPS.messageGroupReadsView, 'v1', { mutations: false });

export default messageGroupReadsView;
