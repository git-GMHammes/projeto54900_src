// Espelho de: app/Config/Routes/Api/v1/Nav/NavManager/EndpointTable.php
// Grupo: api/v1/nav-manager  ->  Api\V1\Nav\NavManager\ResourceTableController
//
// Tabela nav_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const navManagerTable = createResource(API_GROUPS.navManager, 'v1');

export default navManagerTable;
