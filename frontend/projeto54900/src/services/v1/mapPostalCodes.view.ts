// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view view_map_postal_codes.
// Espelho de app/Config/Routes/Api/v1/Map/MapPostalCodes/EndPointView.php, grupo api/v1/map-postal-codes-view
// -> Api\V1\Map\MapPostalCodes\ResourceViewController.
// Para ESCRITA no registro, ver mapPostalCodes.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const mapPostalCodesView = createResource(API_GROUPS.mapPostalCodesView, 'v1', { mutations: false });

export default mapPostalCodesView;
