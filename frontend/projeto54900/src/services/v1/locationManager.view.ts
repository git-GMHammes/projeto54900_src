// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_location_manager
// (local + root_id, depth, path_ids, path_names, children_count). Espelho de
// app/Config/Routes/Api/v1/Location/LocationManager/EndPointView.php, grupo
// api/v1/location-manager-view. Para ESCRITA, ver locationManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const locationManagerView = createResource(API_GROUPS.locationManagerView, 'v1', { mutations: false });

export default locationManagerView;
