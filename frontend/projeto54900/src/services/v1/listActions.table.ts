// Espelho de: app/Config/Routes/Api/v1/List/ListActions/EndpointTable.php
// Grupo: api/v1/list-actions  ->  Api\V1\List\ListActions\ResourceTableController
//
// Tabela list_actions (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const listActionsTable = createResource(API_GROUPS.listActions, 'v1');

export default listActionsTable;
