/**
 * =========================================================================
 * FILE HEADER — services/v1/navManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela nav_manager — a "casca" de config/branding do app/navbar (nome
 * do app, imagem, icone de mensagens, versao do sistema), pai da arvore de
 * menu_manager. Espelho de
 * app/Config/Routes/Api/v1/Nav/NavManager/EndpointTable.php, grupo
 * api/v1/nav-manager -> Api\V1\Nav\NavManager\ResourceTableController. Sem
 * view propria (nao existe navManager.view.ts).
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.navManager).
 * CONSUMIDORES: pages/v1/nav/{GetAllPage,CreatePage,GetPage,UpdatePage}.tsx
 * (CRUD do modulo) e hooks/useSiteMenu.ts (busca o nav ativo para montar a
 * navbar dinamica). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre nav_manager. */
export const navManagerTable = createResource(API_GROUPS.navManager, 'v1');

export default navManagerTable;
