// PROPOSITO: recurso REST da tabela temp_manager (catalogo de templates e as empresas que usam cada um).
// Espelho de app/Config/Routes/Api/v1/Template/TempManager/EndpointTable.php, grupo
// api/v1/temp-manager. Acesso exclusivo do superuser.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const tempManagerTable = createResource(API_GROUPS.tempManager, 'v1');

export default tempManagerTable;
