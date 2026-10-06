// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_message_groups_manager. Espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupsManager/EndPointView.php, grupo
// api/v1/message-groups-manager-view -> Api\V1\Messages\MessageGroupsManager\ResourceViewController.
// Para ESCRITA no registro, ver messageGroupsManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupsManagerView = createResource(API_GROUPS.messageGroupsManagerView, 'v1', { mutations: false });

export default messageGroupsManagerView;
