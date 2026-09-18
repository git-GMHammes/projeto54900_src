/**
 * =========================================================================
 * FILE HEADER — services/v1/formRows.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela form_rows — o nivel "linha" da arvore do construtor de
 * formularios (form_manager -> form_groups -> form_rows -> form_fields).
 * Espelho de app/Config/Routes/Api/v1/Form/FormRows/EndpointTable.php,
 * grupo api/v1/form-rows -> Api\V1\Form\FormRows\ResourceTableController.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.formRows).
 * CONSUMIDORES: pages/v1/form/FormBuilderPage.tsx e
 * pages/v1/form/FormConstructorPage.tsx (construtor legado). Reexportado
 * pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre form_rows. */
export const formRowsTable = createResource(API_GROUPS.formRows, 'v1');

export default formRowsTable;
