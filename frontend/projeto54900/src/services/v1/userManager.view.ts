// Espelho de: app/Config/Routes/Api/v1/User/UserManager/EndPointView.php
// Grupo: api/v1/user-manager-view  ->  Api\V1\User\UserManager\ResourceViewController
//
// View view_user_manager (somente leitura).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const userManagerView = createResource(API_GROUPS.userManagerView, 'v1', { mutations: false });

export default userManagerView;
