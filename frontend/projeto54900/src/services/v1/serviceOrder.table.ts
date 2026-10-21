// PROPOSITO: recurso REST da tabela service_order — pedido de servico (orcamento, agenda, execucao).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceOrder/EndpointTable.php, grupo api/v1/service-order.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceOrderTable = createResource(API_GROUPS.serviceOrder, 'v1');

export default serviceOrderTable;
