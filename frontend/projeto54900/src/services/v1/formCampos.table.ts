/**
 * =========================================================================
 * FILE HEADER — services/v1/formCampos.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete)
 * da tabela form_fields — os campos individuais de uma linha do construtor
 * de formularios (arvore form_manager -> form_groups -> form_rows ->
 * form_fields). Espelho de
 * app/Config/Routes/Api/v1/Form/FormCampos/EndpointTable.php, grupo
 * api/v1/form-campos -> Api\V1\Form\FormCampos\ResourceTableController.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, gera os metodos
 * REST padrao) e constants/api (API_GROUPS.formCampos, nome do grupo de
 * endpoint).
 * CONSUMIDORES: pages/v1/form/FormBuilderPage.tsx (monta/edita a arvore
 * completa) e pages/v1/form/FormConstructorPage.tsx (construtor legado).
 * Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: criar um arquivo `<recurso>.table.ts`
 * chamando `createResource(API_GROUPS.<recurso>, 'v1')` e adicionar o grupo
 * correspondente em constants/api.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao (list/get/create/update/delete) sobre form_fields. */
export const formCamposTable = createResource(API_GROUPS.formCampos, 'v1');

export default formCamposTable;
