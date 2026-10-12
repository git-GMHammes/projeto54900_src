// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_routes.
// Espelho de app/Config/Routes/Api/v1/Map/MapRoutes/EndPointView.php, grupo api/v1/map-routes-view
// -> Api\V1\Map\MapRoutes\ResourceViewController.
// Para ESCRITA no registro, ver mapRoutes.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapRoutesView = createResource(API_GROUPS.mapRoutesView, 'v1', { mutations: false });

export default mapRoutesView;
