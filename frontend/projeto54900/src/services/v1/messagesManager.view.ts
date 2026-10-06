// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_messages_manager. Espelho de
// app/Config/Routes/Api/v1/Messages/MessagesManager/EndPointView.php, grupo
// api/v1/messages-manager-view -> Api\V1\Messages\MessagesManager\ResourceViewController.
// Para ESCRITA no registro, ver messagesManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messagesManagerView = createResource(API_GROUPS.messagesManagerView, 'v1', { mutations: false });

export default messagesManagerView;
