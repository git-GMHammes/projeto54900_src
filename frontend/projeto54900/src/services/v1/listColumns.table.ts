/**
 * =========================================================================
 * FILE HEADER — services/v1/listColumns.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela list_columns — as colunas exibidas na grid de um list_manager
 * (label, campo de origem, formatacao). Espelho de
 * app/Config/Routes/Api/v1/List/ListColumns/EndpointTable.php, grupo
 * api/v1/list-columns -> Api\V1\List\ListColumns\ResourceTableController.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.listColumns).
 * CONSUMIDORES: pages/v1/list/ListBuilderPage.tsx (arvore
 * list_manager -> [list_columns, list_actions]) e
 * pages/v1/list/ListConstructorPage.tsx (renderiza a grid real usando as
 * colunas definidas). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre list_columns. */
export const listColumnsTable = createResource(API_GROUPS.listColumns, 'v1');

export default listColumnsTable;
