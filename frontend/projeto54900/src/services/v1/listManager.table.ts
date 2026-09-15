// Espelho de: app/Config/Routes/Api/v1/List/ListManager/EndpointTable.php
// Grupo: api/v1/list-manager  ->  Api\V1\List\ListManager\ResourceTableController
//
// Tabela list_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const listManagerTable = createResource(API_GROUPS.listManager, 'v1');

export default listManagerTable;
