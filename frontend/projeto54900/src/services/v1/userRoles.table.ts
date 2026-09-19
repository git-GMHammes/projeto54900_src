/**
 * =========================================================================
 * FILE HEADER — services/v1/userRoles.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso da tabela user_roles (perfis de acesso). APESAR do
 * sufixo `.table` (convencao do projeto para "endpoint sobre tabela"), o
 * modulo e READ-ONLY no backend — por isso aqui tambem so leitura
 * (`{ mutations: false }`), igual a um `.view.ts`; nao existe uma
 * view separada para este recurso porque a tabela em si ja e somente
 * leitura. Espelho de
 * app/Config/Routes/Api/v1/User/UserRoles/EndpointTable.php, grupo
 * api/v1/user-roles -> Api\V1\User\UserRoles\ResourceTableController.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, aqui com
 * `{ mutations: false }`) e constants/api (API_GROUPS.userRoles).
 * CONSUMIDORES: nenhum consumidor direto hoje alem do reexport pelo barrel
 * services/v1/index.ts — disponivel para quando uma tela de perfis/roles
 * for criada (ex.: select de "role" no formulario de usuario).
 *
 * COMO REAPROVEITAR EM OUTRA TABELA READ-ONLY: chamar
 * `createResource(API_GROUPS.<recurso>, 'v1', { mutations: false })` —
 * mesmo padrao usado nos arquivos `.view.ts` deste diretorio.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — so metodos de leitura (list/get) sobre user_roles. */
export const userRolesTable = createResource(API_GROUPS.userRoles, 'v1', {
  mutations: false,
});

export default userRolesTable;
