/**
 * =========================================================================
 * FILE HEADER — services/v1/listActions.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela list_actions — as acoes de linha (editar/excluir/link
 * customizado, etc.) do Construtor de Listas, ligadas a um list_manager.
 * Espelho de app/Config/Routes/Api/v1/List/ListActions/EndpointTable.php,
 * grupo api/v1/list-actions -> Api\V1\List\ListActions\ResourceTableController.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.listActions).
 * CONSUMIDORES: pages/v1/list/ListBuilderPage.tsx (arvore
 * list_manager -> [list_columns, list_actions]) e
 * pages/v1/list/ListConstructorPage.tsx (renderiza a grid real usando as
 * acoes definidas). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre list_actions. */
export const listActionsTable = createResource(API_GROUPS.listActions, 'v1');

export default listActionsTable;
