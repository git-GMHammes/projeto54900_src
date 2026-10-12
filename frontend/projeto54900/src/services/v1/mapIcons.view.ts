// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_icons.
// Espelho de app/Config/Routes/Api/v1/Map/MapIcons/EndPointView.php, grupo api/v1/map-icons-view
// -> Api\V1\Map\MapIcons\ResourceViewController.
// Para ESCRITA no registro, ver mapIcons.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapIconsView = createResource(API_GROUPS.mapIconsView, 'v1', { mutations: false });

export default mapIconsView;
