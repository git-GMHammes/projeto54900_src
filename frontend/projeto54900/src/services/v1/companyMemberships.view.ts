// PROPOSITO: recurso REST SOMENTE LEITURA sobre a view view_company_memberships (uma empresa
// por linha com members_count e members_names). Espelho de
// app/Config/Routes/Api/v1/Company/CompanyMemberships/EndPointView.php, grupo
// api/v1/company-memberships-view. Fonte do select de empresas do editor de membros.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const companyMembershipsView = createResource(API_GROUPS.companyMembershipsView, 'v1', { mutations: false });

export default companyMembershipsView;
