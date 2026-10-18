// PROPOSITO: recurso REST da tabela location_manager (locais em arvore recursiva por parent_id).
// Espelho de app/Config/Routes/Api/v1/Location/LocationManager/EndpointTable.php, grupo
// api/v1/location-manager. Regras no Processor: ciclo 409, code repetido 409, pai invalido 422,
// excluir local com filhos 409.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const locationManagerTable = createResource(API_GROUPS.locationManager, 'v1');

export default locationManagerTable;
