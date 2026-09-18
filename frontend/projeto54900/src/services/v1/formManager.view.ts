/**
 * =========================================================================
 * FILE HEADER — services/v1/formManager.view.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
 * view_form_manager — 1 linha por campo (JOIN achatado de form_manager +
 * form_groups + form_rows + form_fields, com prefixos fm_/fg_/fr_/fc_ por
 * tabela de origem). Espelho de
 * app/Config/Routes/Api/v1/Form/FormManager/EndPointView.php, grupo
 * api/v1/form-manager-view -> Api\V1\Form\FormManager\ResourceViewController.
 * Para ESCRITA no registro raiz, ver formManager.table.ts (e os arquivos
 * irmaos formGroups/formRows/formCampos.table.ts para os demais niveis).
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, aqui com
 * `{ mutations: false }` — nao gera create/update/delete) e constants/api
 * (API_GROUPS.formManagerView).
 * CONSUMIDORES: pages/v1/form/FormConstructorPage.tsx (construtor legado,
 * consome a view agrupada), pages/v1/form/FormBuilderPage.tsx e
 * pages/v1/form/FormRendererPage.tsx (le a definicao para renderizar um
 * formulario), pages/v1/user/register/RegisterPage.tsx (via
 * loadFormByTable(), resolve o form ativo por fm_table_name). Reexportado
 * pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRA VIEW SOMENTE LEITURA: chamar
 * `createResource(API_GROUPS.<view>, 'v1', { mutations: false })` — ver
 * tambem uploadManager.view.ts e userManager.view.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — so metodos de leitura (list/get) sobre view_form_manager. */
export const formManagerView = createResource(API_GROUPS.formManagerView, 'v1', { mutations: false });

export default formManagerView;
