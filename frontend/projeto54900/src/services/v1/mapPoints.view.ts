// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_points.
// Espelho de app/Config/Routes/Api/v1/Map/MapPoints/EndPointView.php, grupo api/v1/map-points-view
// -> Api\V1\Map\MapPoints\ResourceViewController.
// Para ESCRITA no registro, ver mapPoints.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapPointsView = createResource(API_GROUPS.mapPointsView, 'v1', { mutations: false });

export default mapPointsView;
