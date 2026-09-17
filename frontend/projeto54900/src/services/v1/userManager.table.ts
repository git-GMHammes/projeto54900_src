/**
 * =========================================================================
 * FILE HEADER — services/v1/userManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela user_manager — login (username + password_hash), a tabela "pai"
 * do fluxo composto de cadastro (ver
 * pages/v1/user/register/RegisterPage.tsx, que cria aqui e depois em
 * user_profiles ligado pela FK user_manager_id). Espelho de
 * app/Config/Routes/Api/v1/User/UserManager/EndpointTable.php, grupo
 * api/v1/user-manager -> Api\V1\User\UserManager\ResourceTableController.
 * Para LEITURA agrupada e somente leitura, ver userManager.view.ts.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.userManager).
 * CONSUMIDORES: pages/v1/user/user-manager/{CreatePage,UpdatePage}.tsx
 * (escrita direta na tabela). Reexportado pelo barrel
 * services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre user_manager. */
export const userManagerTable = createResource(API_GROUPS.userManager, 'v1');

export default userManagerTable;
