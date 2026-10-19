// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre view_service_order (pedido + servico, executor, cliente, prazo (is_late)).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceOrder/EndPointView.php, grupo api/v1/service-order-view.
// Para ESCRITA, ver o arquivo .table.ts correspondente.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceOrderView = createResource(API_GROUPS.serviceOrderView, 'v1', { mutations: false });

export default serviceOrderView;
