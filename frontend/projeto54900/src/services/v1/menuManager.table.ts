/**
 * =========================================================================
 * FILE HEADER — services/v1/menuManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela menu_manager — a arvore de itens navegaveis do sistema. Cada
 * item pertence a um nav_manager (FK nav_manager_id) e pode ter um
 * parent_id (submenu). Espelho de
 * app/Config/Routes/Api/v1/Menu/MenuManager/EndpointTable.php, grupo
 * api/v1/menu-manager -> Api\V1\Menu\MenuManager\ResourceTableController.
 * Sem view propria (nao existe menuManager.view.ts).
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.menuManager).
 * CONSUMIDORES: pages/v1/menu/{GetAllPage,CreatePage,GetPage,UpdatePage}.tsx
 * (CRUD do modulo) e hooks/useSiteMenu.ts (monta a navbar dinamica a partir
 * do nav-manager ativo e sua arvore de menu). Reexportado pelo barrel
 * services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre menu_manager. */
export const menuManagerTable = createResource(API_GROUPS.menuManager, 'v1');

export default menuManagerTable;
