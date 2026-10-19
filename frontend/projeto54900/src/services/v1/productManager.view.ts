// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_product_manager (produto + pai, local, children_count e attributes_count).
// Espelho de app/Config/Routes/Api/v1/Product/ProductManager/EndPointView.php, grupo api/v1/product-manager-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const productManagerView = createResource(API_GROUPS.productManagerView, 'v1', { mutations: false });

export default productManagerView;
