// PROPOSITO: recurso REST da tabela message_groups_manager (espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupsManager/EndpointTable.php, grupo api/v1/message-groups-manager).
// Leitura/escrita pelos endpoints padrão; a regra de quem vê (dono e membros ativos) e quem altera
// (so o dono) fica no backend.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const messageGroupsManagerTable = createResource(API_GROUPS.messageGroupsManager, 'v1');

export default messageGroupsManagerTable;
