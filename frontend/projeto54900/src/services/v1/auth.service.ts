/**
 * =========================================================================
 * FILE HEADER — services/v1/auth.service.ts
 * =========================================================================
 *
 * PROPOSITO: chamadas de autenticacao (login/refresh/logout/me). NAO usa
 * resourceFactory — auth nao e um recurso de tabela (sem list/create padrao
 * de CRUD), entao as 4 funcoes chamam http.ts diretamente. Espelho de
 * app/Config/Routes/Api/v1/Auth/EndpointAuth.php, grupo api/v1/auth ->
 * Api\V1\Auth\AuthController.
 *
 * DEPENDENCIAS: services/http (http.get/post + ApiError), constants/api
 * (API_GROUPS.auth, DEFAULT_API_VERSION), utils/apiResult (normalizeItem,
 * extrai o objeto de dentro do envelope da resposta) e types/auth
 * (AuthPayload, AuthUser).
 * CONSUMIDORES: pages/v1/auth/LoginPage.tsx (login) e
 * context/AuthContext.tsx (guarda o resultado do login, chama refresh/
 * logout/me sem tela propria — ver routes/v1/auth.routes.tsx). Reexportado
 * pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR PARA OUTRO ENDPOINT SEM CRUD PADRAO: nao usar
 * createResource; montar o `base` com API_GROUPS/DEFAULT_API_VERSION e
 * escrever uma funcao por operacao, chamando http.get/post diretamente (ver
 * tambem dbSchema.ts, mesmo padrao).
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import { normalizeItem } from '@/utils/apiResult';
import type { AuthPayload, AuthUser } from '@/types/auth';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.auth}`;

/**
 * Autentica com username/password e retorna o payload de tokens do usuario.
 * @throws Error se a resposta vier sem dados (ex.: corpo vazio inesperado)
 */
async function login(username: string, password: string): Promise<AuthPayload> {
  const raw = await http.post(`${base}/login`, { username, password });
  const data = normalizeItem<AuthPayload>(raw);
  if (!data) throw new Error('Resposta de login sem dados.');
  return data;
}

/**
 * Troca um refresh_token valido por um novo par de tokens.
 * @throws Error se a resposta vier sem dados
 */
async function refresh(refreshToken: string): Promise<AuthPayload> {
  const raw = await http.post(`${base}/refresh`, { refresh_token: refreshToken });
  const data = normalizeItem<AuthPayload>(raw);
  if (!data) throw new Error('Resposta de refresh sem dados.');
  return data;
}

/**
 * Encerra a sessao no backend (user_manager.token NULL — revoga refresh e
 * access token do par). O Bearer vai pelo http.ts; o refresh_token no corpo
 * garante a revogacao mesmo com o access token ja expirado.
 */
async function logout(refreshToken: string | null): Promise<void> {
  await http.post(`${base}/logout`, refreshToken ? { refresh_token: refreshToken } : {});
}

/** Retorna o usuario autenticado atual, ou null se a sessao nao for valida. */
async function me(): Promise<AuthUser | null> {
  const raw = await http.get(`${base}/me`);
  return normalizeItem<AuthUser>(raw);
}

export const authService = { login, refresh, logout, me };

export default authService;
