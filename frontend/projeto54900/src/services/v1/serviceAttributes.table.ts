// PROPOSITO: recurso REST da tabela service_attributes — caracteristicas do servico (grupo -> campo).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceAttributes/EndpointTable.php, grupo api/v1/service-attributes.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceAttributesTable = createResource(API_GROUPS.serviceAttributes, 'v1');

export default serviceAttributesTable;
