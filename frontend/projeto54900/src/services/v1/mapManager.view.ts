// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_manager.
// Espelho de app/Config/Routes/Api/v1/Map/MapManager/EndPointView.php, grupo api/v1/map-manager-view
// -> Api\V1\Map\MapManager\ResourceViewController.
// Para ESCRITA no registro, ver mapManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapManagerView = createResource(API_GROUPS.mapManagerView, 'v1', { mutations: false });

export default mapManagerView;
