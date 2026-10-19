// PROPOSITO: recurso REST da tabela movement_manager — movimento de produto (entry, exit, reservation, waste, order).
// Espelho de app/Config/Routes/Api/v1/Movement/MovementManager/EndpointTable.php, grupo api/v1/movement-manager.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const movementManagerTable = createResource(API_GROUPS.movementManager, 'v1');

export default movementManagerTable;
