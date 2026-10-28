// PROPOSITO: recurso REST da tabela temp_header (cabecalho do template).
// Espelho de app/Config/Routes/Api/v1/Template/TempHeader/EndpointTable.php, grupo
// api/v1/temp-header. Leitura para autenticados (so as linhas da empresa da sessao);
// escrita so admin.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const tempHeaderTable = createResource(API_GROUPS.tempHeader, 'v1');

export default tempHeaderTable;
