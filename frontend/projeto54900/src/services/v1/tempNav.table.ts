// Espelho de: app/Config/Routes/Api/v1/Template/TempNav/EndpointTable.php
// Grupo: api/v1/temp-nav  ->  Api\V1\Template\TempNav\ResourceTableController
//
// Tabela temp_nav (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const tempNavTable = createResource(API_GROUPS.tempNav, 'v1');

export default tempNavTable;
