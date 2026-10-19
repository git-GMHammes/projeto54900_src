// PROPOSITO: recurso REST da tabela product_manager — produto (arvore opcional por parent_id; location_id opcional).
// Espelho de app/Config/Routes/Api/v1/Product/ProductManager/EndpointTable.php, grupo api/v1/product-manager.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const productManagerTable = createResource(API_GROUPS.productManager, 'v1');

export default productManagerTable;
