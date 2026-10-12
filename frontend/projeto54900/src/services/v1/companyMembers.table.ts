// PROPOSITO: recurso REST da tabela company_members (espelho de
// app/Config/Routes/Api/v1/Company/CompanyMembers/EndpointTable.php, grupo api/v1/company-members)
// mais a rota extra PUT sync/{companyId} (EndpointCustom.php), que adiciona/reativa e remove varios
// membros da empresa numa transacao. Escrita so admin (decidido pelo backend).

import { createResource } from '@/services/resourceFactory';
import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';

export const companyMembersTable = createResource(API_GROUPS.companyMembers, 'v1');

/** Resposta do sync: quantos vinculos foram criados, reativados, removidos e ignorados. */
export interface CompanySyncResult {
  added: number;
  reactivated: number;
  removed: number;
  skipped: number;
}

/** PUT sync/{companyId} — grava de uma vez os usuarios a adicionar e a remover da empresa. */
export function syncCompanyMembers(
  companyId: string | number,
  body: { add_user_ids: number[]; remove_user_ids: number[] },
): Promise<unknown> {
  return http.put(`/v1/${API_GROUPS.companyMembers}/sync/${companyId}`, body);
}

export default companyMembersTable;
