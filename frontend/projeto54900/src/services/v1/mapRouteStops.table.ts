// PROPOSITO: recurso REST da tabela map_route_stops (paradas do trajeto). Espelho de
// app/Config/Routes/Api/v1/Map/MapRouteStops/EndpointTable.php, grupo api/v1/map-route-stops
// -> Api\V1\Map\MapRouteStops\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_route_stops), ver mapRouteStops.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapRouteStopsTable = createResource(API_GROUPS.mapRouteStops, 'v1');

export default mapRouteStopsTable;
