/**
 * =========================================================================
 * FILE HEADER — services/v1/userManager.view.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
 * view_user_manager. Espelho de
 * app/Config/Routes/Api/v1/User/UserManager/EndPointView.php, grupo
 * api/v1/user-manager-view -> Api\V1\User\UserManager\ResourceViewController.
 * Para ESCRITA no registro, ver userManager.table.ts.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, aqui com
 * `{ mutations: false }`) e constants/api (API_GROUPS.userManagerView).
 * CONSUMIDORES: pages/v1/user/user-manager/GetPage.tsx (detalhe); a funcao
 * passada e generica o bastante para transitar por hooks/useApi.ts e
 * hooks/usePagination.ts (estado de chamada assincrona/paginacao, sem
 * conhecer o recurso especifico). Reexportado pelo barrel
 * services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRA VIEW SOMENTE LEITURA: chamar
 * `createResource(API_GROUPS.<view>, 'v1', { mutations: false })` — ver
 * tambem formManager.view.ts e uploadManager.view.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — so metodos de leitura (list/get) sobre view_user_manager. */
export const userManagerView = createResource(API_GROUPS.userManagerView, 'v1', { mutations: false });

export default userManagerView;
