// PROPOSITO: recurso REST SOMENTE LEITURA sobre a view view_user_resource_access
// (permissao + usuario + slug/titulo do form ou list). Espelho de
// app/Config/Routes/Api/v1/User/UserResourceAccess/EndPointView.php, grupo
// api/v1/user-resource-access-view. So admin.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const userResourceAccessView = createResource(API_GROUPS.userResourceAccessView, 'v1', { mutations: false });

export default userResourceAccessView;
