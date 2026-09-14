// Espelho de: app/Config/Routes/Api/v1/Auth/EndpointAuth.php
// Grupo: api/v1/auth -> Api\V1\Auth\AuthController
//
// Nao usa resourceFactory (nao e um recurso de tabela) — chamadas diretas via http.ts.

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import { normalizeItem } from '@/utils/apiResult';
import type { AuthPayload, AuthUser } from '@/types/auth';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.auth}`;

async function login(username: string, password: string): Promise<AuthPayload> {
  const raw = await http.post(`${base}/login`, { username, password });
  const data = normalizeItem<AuthPayload>(raw);
  if (!data) throw new Error('Resposta de login sem dados.');
  return data;
}

async function refresh(refreshToken: string): Promise<AuthPayload> {
  const raw = await http.post(`${base}/refresh`, { refresh_token: refreshToken });
  const data = normalizeItem<AuthPayload>(raw);
  if (!data) throw new Error('Resposta de refresh sem dados.');
  return data;
}

async function logout(): Promise<void> {
  await http.post(`${base}/logout`);
}

async function me(): Promise<AuthUser | null> {
  const raw = await http.get(`${base}/me`);
  return normalizeItem<AuthUser>(raw);
}

export const authService = { login, refresh, logout, me };

export default authService;
