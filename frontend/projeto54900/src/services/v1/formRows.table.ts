// Espelho de: app/Config/Routes/Api/v1/Form/FormRows/EndpointTable.php
// Grupo: api/v1/form-rows  ->  Api\V1\Form\FormRows\ResourceTableController
//
// Tabela form_rows (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const formRowsTable = createResource(API_GROUPS.formRows, 'v1');

export default formRowsTable;
