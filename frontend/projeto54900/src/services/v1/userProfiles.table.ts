// Espelho de: app/Config/Routes/Api/v1/User/UserProfiles/EndpointTable.php
// Grupo: api/v1/user-profiles  ->  Api\V1\User\UserProfiles\ResourceTableController
//
// Tabela user_profiles (leitura + escrita + soft/hard delete) via createResource.
// "me" nao faz parte do endpoint-set padrao (so este recurso tem essa rota
// self-service) — chamado direto com http, como manda resourceFactory.ts.

import { http } from '@/services/http';
import { createResource } from '@/services/resourceFactory';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';

export const userProfilesTable = createResource(API_GROUPS.userProfiles, 'v1');

/** GET user-profiles/me — perfil (user_profiles) do usuario autenticado. */
export function userProfilesMe(): Promise<unknown> {
  return http.get(`/${DEFAULT_API_VERSION}/${API_GROUPS.userProfiles}/me`);
}

export default userProfilesTable;
