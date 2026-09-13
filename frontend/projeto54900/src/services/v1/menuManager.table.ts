// Espelho de: app/Config/Routes/Api/v1/Menu/MenuManager/EndpointTable.php
// Grupo: api/v1/menu-manager  ->  Api\V1\Menu\MenuManager\ResourceTableController
//
// Tabela menu_manager (leitura + escrita + soft/hard delete).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const menuManagerTable = createResource(API_GROUPS.menuManager, 'v1');

export default menuManagerTable;
