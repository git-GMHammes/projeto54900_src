// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_users_groups.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageUsersGroups/EndPointView.php, grupo
// api/v1/message-users-groups-view -> Api\V1\Messages\MessageUsersGroups\ResourceViewController. Usuarios ativos com a contagem de grupos (card de usuarios).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageUsersGroupsView = createResource(API_GROUPS.messageUsersGroupsView, 'v1', { mutations: false });

export default messageUsersGroupsView;
