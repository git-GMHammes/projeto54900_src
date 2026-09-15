// Espelho de: app/Config/Routes/Api/v1/List/ListColumns/EndpointTable.php
// Grupo: api/v1/list-columns  ->  Api\V1\List\ListColumns\ResourceTableController
//
// Tabela list_columns (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const listColumnsTable = createResource(API_GROUPS.listColumns, 'v1');

export default listColumnsTable;
