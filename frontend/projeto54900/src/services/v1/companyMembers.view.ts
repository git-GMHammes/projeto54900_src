// PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
// view_company_members (vinculo + empresa + usuario/perfil). Espelho de
// app/Config/Routes/Api/v1/Company/CompanyMembers/EndPointView.php, grupo
// api/v1/company-members-view. Escopo no backend: empresas do usuario (admin ve tudo).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const companyMembersView = createResource(API_GROUPS.companyMembersView, 'v1', { mutations: false });

export default companyMembersView;
