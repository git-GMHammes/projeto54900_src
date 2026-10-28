// Espelho de: app/Config/Routes/Api/v1/Template/TempMenu/EndpointTable.php
// Grupo: api/v1/temp-menu  ->  Api\V1\Template\TempMenu\ResourceTableController
//
// Tabela temp_menu (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const tempMenuTable = createResource(API_GROUPS.tempMenu, 'v1');

export default tempMenuTable;
