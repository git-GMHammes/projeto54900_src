// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_route_stops.
// Espelho de app/Config/Routes/Api/v1/Map/MapRouteStops/EndPointView.php, grupo api/v1/map-route-stops-view
// -> Api\V1\Map\MapRouteStops\ResourceViewController.
// Para ESCRITA no registro, ver mapRouteStops.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapRouteStopsView = createResource(API_GROUPS.mapRouteStopsView, 'v1', { mutations: false });

export default mapRouteStopsView;
