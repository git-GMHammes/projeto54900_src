// PROPOSITO: recurso REST da tabela map_routes (trajetos). Espelho de
// app/Config/Routes/Api/v1/Map/MapRoutes/EndpointTable.php, grupo api/v1/map-routes
// -> Api\V1\Map\MapRoutes\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_routes), ver mapRoutes.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapRoutesTable = createResource(API_GROUPS.mapRoutes, 'v1');

export default mapRoutesTable;
