// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_movement_stock (saldo por produto (saldo, reservado, encomendado, disponivel, below_min)).
// Espelho de app/Config/Routes/Api/v1/Movement/MovementStock/EndPointView.php, grupo api/v1/movement-stock-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const movementStockView = createResource(API_GROUPS.movementStockView, 'v1', { mutations: false });

export default movementStockView;
