// Espelho de: app/Config/Routes/Api/v1/User/UserRoles/EndpointTable.php
// Grupo: api/v1/user-roles  ->  Api\V1\User\UserRoles\ResourceTableController
//
// Tabela user_roles (perfis de acesso). Modulo READ-ONLY no backend — aqui
// tambem so leitura (`{ mutations: false }`).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const userRolesTable = createResource(API_GROUPS.userRoles, 'v1', {
  mutations: false,
});

export default userRolesTable;
