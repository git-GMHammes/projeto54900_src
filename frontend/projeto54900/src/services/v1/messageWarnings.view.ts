// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_warnings (advertencia +
// mensagem + grupo + autor, sem dados pessoais sensiveis). Espelho de
// app/Config/Routes/Api/v1/Messages/MessageWarnings/EndPointView.php, grupo api/v1/message-warnings-view. So admin.
// Escrita: messageWarnings.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageWarningsView = createResource(API_GROUPS.messageWarningsView, 'v1', { mutations: false });

export default messageWarningsView;
