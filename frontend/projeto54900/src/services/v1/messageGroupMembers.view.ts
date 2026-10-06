// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_message_group_members.
// Espelho de app/Config/Routes/Api/v1/Messages/MessageGroupMembers/EndPointView.php, grupo
// api/v1/message-group-members-view -> Api\V1\Messages\MessageGroupMembers\ResourceViewController. Escrita: messageGroupMembers.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupMembersView = createResource(API_GROUPS.messageGroupMembersView, 'v1', { mutations: false });

export default messageGroupMembersView;
