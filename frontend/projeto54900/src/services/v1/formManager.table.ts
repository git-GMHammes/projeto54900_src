// Espelho de: app/Config/Routes/Api/v1/Form/FormManager/EndpointTable.php
// Grupo: api/v1/form-manager  ->  Api\V1\Form\FormManager\ResourceTableController
//
// Tabela form_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const formManagerTable = createResource(API_GROUPS.formManager, 'v1');

export default formManagerTable;
