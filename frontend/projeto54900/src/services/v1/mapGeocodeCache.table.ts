// PROPOSITO: recurso REST da tabela map_geocode_cache (cache de geocodificacao). Espelho de
// app/Config/Routes/Api/v1/Map/MapGeocodeCache/EndpointTable.php, grupo api/v1/map-geocode-cache
// -> Api\V1\Map\MapGeocodeCache\ResourceTableController.
// Leitura/escrita pelos endpoints padrao; regras de negocio no backend. Para LEITURA da view
// (view_map_geocode_cache), ver mapGeocodeCache.view.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapGeocodeCacheTable = createResource(API_GROUPS.mapGeocodeCache, 'v1');

export default mapGeocodeCacheTable;
