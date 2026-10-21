// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_product_attributes (atributo + dados do produto).
// Espelho de app/Config/Routes/Api/v1/Product/ProductAttributes/EndPointView.php, grupo api/v1/product-attributes-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const productAttributesView = createResource(API_GROUPS.productAttributesView, 'v1', { mutations: false });

export default productAttributesView;
