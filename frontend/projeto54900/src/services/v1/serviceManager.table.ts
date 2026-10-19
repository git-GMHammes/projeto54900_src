// PROPOSITO: recurso REST da tabela service_manager — catalogo de servicos (arvore opcional por parent_id).
// Espelho de app/Config/Routes/Api/v1/Service/ServiceManager/EndpointTable.php, grupo api/v1/service-manager.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const serviceManagerTable = createResource(API_GROUPS.serviceManager, 'v1');

export default serviceManagerTable;
