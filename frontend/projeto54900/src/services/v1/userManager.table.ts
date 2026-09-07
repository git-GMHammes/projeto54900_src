// Espelho de: app/Config/Routes/Api/v1/User/UserManager/EndpointTable.php
// Grupo: api/v1/user-manager  ->  Api\V1\User\UserManager\ResourceTableController
//
// Tabela user_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const userManagerTable = createResource(API_GROUPS.userManager, 'v1');

export default userManagerTable;
