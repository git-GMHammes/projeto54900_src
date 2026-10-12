// PROPOSITO: recurso REST da tabela user_resource_access (permissao individual de um
// usuario a um form ou list, independente da empresa). Espelho de
// app/Config/Routes/Api/v1/User/UserResourceAccess/EndpointTable.php, grupo
// api/v1/user-resource-access. Todas as rotas sao so admin (adminonly no backend).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const userResourceAccessTable = createResource(API_GROUPS.userResourceAccess, 'v1');

export default userResourceAccessTable;
