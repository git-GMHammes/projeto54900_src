/**
 * =========================================================================
 * FILE HEADER — services/v1/listManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela list_manager — a raiz da arvore do Construtor de Listas
 * (list_manager -> [list_columns, list_actions]), guarda slug,
 * api_get_endpoint e demais metadados de cada listagem. Espelho de
 * app/Config/Routes/Api/v1/List/ListManager/EndpointTable.php, grupo
 * api/v1/list-manager -> Api\V1\List\ListManager\ResourceTableController.
 * Diferente do modulo form, aqui NAO existe uma view agrupada equivalente a
 * view_form_manager — a hidratacao de edicao busca colunas/acoes por
 * list_manager_id separadamente (ver README_list_constructor.md).
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.listManager).
 * CONSUMIDORES: pages/v1/list/ListBuilderPage.tsx (cria/atualiza o registro
 * raiz), pages/v1/list/ListConstructorPage.tsx e varias telas de listagem
 * (GetAllPage de user, menu, nav, upload; FormConstructorListPage) que
 * resolvem sua listagem por slug de list_manager. Reexportado pelo barrel
 * services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre list_manager. */
export const listManagerTable = createResource(API_GROUPS.listManager, 'v1');

export default listManagerTable;
