// PROPOSITO: template da empresa da sessao e preferencia de template do usuario.
// Espelho de app/Config/Routes/Api/v1/Template/TemplateRender/EndpointRender.php, grupo api/v1/template-render
// (desvio sancionado do conjunto padrao: so GET get e PUT preference), chamado direto com http.

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';

const BASE = `/${DEFAULT_API_VERSION}/${API_GROUPS.templateRender}`;

/** GET template-public/get/{slug} — rota PUBLICA: so o template padrao (id, code, name) da empresa do slug, para o visitante. */
export function templatePublicGet(slug: string): Promise<unknown> {
  return http.get(`/${DEFAULT_API_VERSION}/${API_GROUPS.templatePublic}/get/${encodeURIComponent(slug)}`);
}

/** GET template-render/get — template efetivo, templates da empresa, escolha gravada, nav, menu, cabecalhos e rodapes. */
export function templateRenderGet(tempNavId?: number): Promise<unknown> {
  return http.get(tempNavId !== undefined ? `${BASE}/get?temp_nav_id=${tempNavId}` : `${BASE}/get`);
}

/** PUT template-render/preference — escolhe o template do proprio usuario; `null` volta ao automatico. */
export function templateRenderSetPreference(tempManagerId: number | null): Promise<unknown> {
  return http.put(`${BASE}/preference`, { temp_manager_id: tempManagerId });
}
