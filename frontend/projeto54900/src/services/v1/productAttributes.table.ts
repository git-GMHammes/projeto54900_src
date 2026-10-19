// PROPOSITO: recurso REST da tabela product_attributes — caracteristicas do produto (grupo -> campo).
// Espelho de app/Config/Routes/Api/v1/Product/ProductAttributes/EndpointTable.php, grupo api/v1/product-attributes.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const productAttributesTable = createResource(API_GROUPS.productAttributes, 'v1');

export default productAttributesTable;
