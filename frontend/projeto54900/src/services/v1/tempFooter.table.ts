// PROPOSITO: recurso REST da tabela temp_footer (rodape do template).
// Espelho de app/Config/Routes/Api/v1/Template/TempFooter/EndpointTable.php, grupo
// api/v1/temp-footer. Leitura para autenticados (so as linhas da empresa da sessao);
// escrita so admin.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const tempFooterTable = createResource(API_GROUPS.tempFooter, 'v1');

export default tempFooterTable;
