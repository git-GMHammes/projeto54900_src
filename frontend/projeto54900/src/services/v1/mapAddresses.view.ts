// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_addresses.
// Espelho de app/Config/Routes/Api/v1/Map/MapAddresses/EndPointView.php, grupo api/v1/map-addresses-view
// -> Api\V1\Map\MapAddresses\ResourceViewController.
// Para ESCRITA no registro, ver mapAddresses.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapAddressesView = createResource(API_GROUPS.mapAddressesView, 'v1', { mutations: false });

export default mapAddressesView;
