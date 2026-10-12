// PROPOSITO: pergunta ao backend se o USUARIO DA SESSAO pode abrir um form ou list.
// Espelho de app/Config/Routes/Api/v1/Meta/ResourceAccess/Endpoint.php:
//   GET api/v1/resource-access/check?type=form|list&id=N   (ou &slug=...)
// Precedencia no backend: admin libera; linha em user_resource_access (allowed 1/0)
// vale; sem linha, vale o `roles` do form/list. Nao e recurso REST padrao
// (rota extra), por isso NAO usa createResource.

import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';
import { normalizeItem } from '@/utils/apiResult';

export type ResourceType = 'form' | 'list';

export interface ResourceAccessResult {
  allowed: boolean;
  /** admin | user | role | open | not_found */
  source: string;
}

/**
 * Negacao EXPLICITA: bloqueio por linha do usuario (source 'user') ou por roles do
 * form/list (source 'role'). Falha de rede/servidor ('error') e recurso inexistente
 * ('not_found') nao contam como negacao -- a tela segue e mostra o proprio erro.
 */
export function isDenied(result: ResourceAccessResult): boolean {
  return !result.allowed && (result.source === 'user' || result.source === 'role');
}

/**
 * Consulta o acesso individual. Em caso de falha de rede/servidor devolve
 * `allowed: false` com source 'error' (nega por seguranca; quem chama decide a UI).
 */
export async function checkResourceAccess(
  type: ResourceType,
  key: { id?: string | number; slug?: string },
): Promise<ResourceAccessResult> {
  try {
    const params: Record<string, string> = { type };
    if (key.id !== undefined && String(key.id) !== '') params.id = String(key.id);
    else if (key.slug) params.slug = key.slug;

    const raw = await http.get(`/v1/${API_GROUPS.resourceAccess}/check`, { params });
    const data = normalizeItem<Record<string, unknown>>(raw);

    const source = typeof data?.source === 'string' ? data.source : 'error';

    return { allowed: data?.allowed === true, source };
  } catch {
    return { allowed: false, source: 'error' };
  }
}
