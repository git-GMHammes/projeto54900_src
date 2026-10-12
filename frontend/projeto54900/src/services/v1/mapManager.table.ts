// PROPOSITO: recurso REST da tabela map_manager (o mapa (centro, zoom, tiles)). Espelho de
// app/Config/Routes/Api/v1/Map/MapManager/EndpointTable.php, grupo api/v1/map-manager
// -> Api\V1\Map\MapManager\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_manager), ver mapManager.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapManagerTable = createResource(API_GROUPS.mapManager, 'v1');

export default mapManagerTable;
