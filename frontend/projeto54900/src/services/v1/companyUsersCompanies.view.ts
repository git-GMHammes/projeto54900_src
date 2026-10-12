// PROPOSITO: recurso REST SOMENTE LEITURA sobre a view view_company_users_companies (um usuario
// por linha com companies_count e companies_names). Espelho de
// app/Config/Routes/Api/v1/Company/CompanyUsersCompanies/EndPointView.php, grupo
// api/v1/company-users-companies-view. Fonte do card de usuarios do editor de membros.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const companyUsersCompaniesView = createResource(API_GROUPS.companyUsersCompaniesView, 'v1', { mutations: false });

export default companyUsersCompaniesView;
