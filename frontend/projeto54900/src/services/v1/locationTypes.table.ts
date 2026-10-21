// PROPOSITO: recurso REST da tabela location_types (rotulos de tipo de local, global).
// Espelho de app/Config/Routes/Api/v1/Location/LocationTypes/EndpointTable.php, grupo
// api/v1/location-types. Leitura para autenticados; escrita so admin; tipo em uso nao e excluido (409).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const locationTypesTable = createResource(API_GROUPS.locationTypes, 'v1');

export default locationTypesTable;
