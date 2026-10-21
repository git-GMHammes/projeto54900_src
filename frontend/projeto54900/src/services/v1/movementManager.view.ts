// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_movement_manager (movimento + produto, usuario e local).
// Espelho de app/Config/Routes/Api/v1/Movement/MovementManager/EndPointView.php, grupo api/v1/movement-manager-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const movementManagerView = createResource(API_GROUPS.movementManagerView, 'v1', { mutations: false });

export default movementManagerView;
