// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_group_memberships.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageGroupMemberships/EndPointView.php, grupo
// api/v1/message-group-memberships-view -> Api\V1\Messages\MessageGroupMemberships\ResourceViewController. Grupos com membros ativos (lista Grupos <-> Membros).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupMembershipsView = createResource(API_GROUPS.messageGroupMembershipsView, 'v1', { mutations: false });

export default messageGroupMembershipsView;
