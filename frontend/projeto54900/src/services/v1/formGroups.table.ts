// Espelho de: app/Config/Routes/Api/v1/Form/FormGroups/EndpointTable.php
// Grupo: api/v1/form-groups  ->  Api\V1\Form\FormGroups\ResourceTableController
//
// Tabela form_groups (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const formGroupsTable = createResource(API_GROUPS.formGroups, 'v1');

export default formGroupsTable;
