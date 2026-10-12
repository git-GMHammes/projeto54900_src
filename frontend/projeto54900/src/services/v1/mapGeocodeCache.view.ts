// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_geocode_cache.
// Espelho de app/Config/Routes/Api/v1/Map/MapGeocodeCache/EndPointView.php, grupo api/v1/map-geocode-cache-view
// -> Api\V1\Map\MapGeocodeCache\ResourceViewController.
// Para ESCRITA no registro, ver mapGeocodeCache.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapGeocodeCacheView = createResource(API_GROUPS.mapGeocodeCacheView, 'v1', { mutations: false });

export default mapGeocodeCacheView;
