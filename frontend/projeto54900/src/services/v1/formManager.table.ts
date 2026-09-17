/**
 * =========================================================================
 * FILE HEADER — services/v1/formManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela form_manager — a raiz da arvore do construtor de formularios
 * (form_manager -> form_groups -> form_rows -> form_fields), guarda titulo,
 * slug, submit_endpoint/httpMethod e status (ativo/inativo) de cada
 * formulario. Espelho de
 * app/Config/Routes/Api/v1/Form/FormManager/EndpointTable.php, grupo
 * api/v1/form-manager -> Api\V1\Form\FormManager\ResourceTableController.
 * Para LEITURA agrupada e somente leitura, ver formManager.view.ts.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.formManager).
 * CONSUMIDORES: pages/v1/form/FormBuilderPage.tsx (cria/atualiza o registro
 * raiz) e pages/v1/form/FormConstructorPage.tsx (construtor legado).
 * Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre form_manager. */
export const formManagerTable = createResource(API_GROUPS.formManager, 'v1');

export default formManagerTable;
