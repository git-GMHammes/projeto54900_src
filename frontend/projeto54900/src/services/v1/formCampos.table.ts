// Espelho de: app/Config/Routes/Api/v1/Form/FormCampos/EndpointTable.php
// Grupo: api/v1/form-campos  ->  Api\V1\Form\FormCampos\ResourceTableController
//
// Tabela form_fields (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const formCamposTable = createResource(API_GROUPS.formCampos, 'v1');

export default formCamposTable;
