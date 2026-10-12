// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_company_manager (empresa + users_count). Espelho de
// app/Config/Routes/Api/v1/Company/CompanyManager/EndPointView.php, grupo
// api/v1/company-manager-view -> Api\V1\Company\CompanyManager\ResourceViewController.
// Para ESCRITA no registro, ver companyManager.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const companyManagerView = createResource(API_GROUPS.companyManagerView, 'v1', { mutations: false });

export default companyManagerView;
