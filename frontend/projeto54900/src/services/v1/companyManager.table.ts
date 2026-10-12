// PROPOSITO: recurso REST da tabela company_manager (cadastro de empresas). Espelho de
// app/Config/Routes/Api/v1/Company/CompanyManager/EndpointTable.php, grupo api/v1/company-manager.
// Leitura para qualquer usuario autenticado; escrita so admin (filtro adminonly no backend).
// A empresa DEFAULT (id=1) nao pode ser excluida (403).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const companyManagerTable = createResource(API_GROUPS.companyManager, 'v1');

export default companyManagerTable;
