// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_links.
// Espelho de app/Config/Routes/Api/v1/Map/MapLinks/EndPointView.php, grupo api/v1/map-links-view
// -> Api\V1\Map\MapLinks\ResourceViewController.
// Para ESCRITA no registro, ver mapLinks.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapLinksView = createResource(API_GROUPS.mapLinksView, 'v1', { mutations: false });

export default mapLinksView;
