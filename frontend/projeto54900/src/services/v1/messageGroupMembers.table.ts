// PROPOSITO: recurso REST da tabela message_group_members (espelho de
// app/Config/Routes/Api/v1/Messages/MessageGroupMembers/EndpointTable.php, grupo api/v1/message-group-members)
// mais a rota extra PUT sync/{groupId} (EndpointCustom.php), que adiciona/reativa e remove varios
// membros do grupo numa transacao. Quem escreve (dono do grupo ou admin) e decidido pelo backend.

import { createResource } from '@/services/resourceFactory';
import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';

export const messageGroupMembersTable = createResource(API_GROUPS.messageGroupMembers, 'v1');

/** Resposta do sync: quantos vinculos foram criados, reativados, removidos e ignorados. */
export interface MessageGroupSyncResult {
  added: number;
  reactivated: number;
  removed: number;
  skipped: number;
}

/** PUT sync/{groupId} — grava de uma vez os usuarios a adicionar e a remover do grupo. */
export function syncMessageGroupMembers(
  groupId: string | number,
  body: { add_user_ids: number[]; remove_user_ids: number[] },
): Promise<unknown> {
  return http.put(`/v1/${API_GROUPS.messageGroupMembers}/sync/${groupId}`, body);
}

export default messageGroupMembersTable;
