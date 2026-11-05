/**
 * =========================================================================
 * FILE HEADER — services/v1/eleicoes2026.public.ts
 * =========================================================================
 *
 * PROPOSITO: acesso SEM LOGIN as APIs Eleicoes2026 (somente leitura) por um JWT especial.
 *   - getEleicoesPublicToken(): busca o token em GET eleicoes-public/token (rota publica), guarda em memoria e
 *     renova sozinho um pouco antes de expirar. Chamadas simultaneas dividem a mesma busca.
 *   - eleicoesPublicGet(group, path, params): GET de um grupo eleicoes2026-* com esse token no cabecalho
 *     `Authorization`, que sobrepoe o token de sessao (se houver).
 * O token tem typ=eleicoes: so vale nos grupos eleicoes2026-*; nas demais APIs a resposta e 401.
 * Sem localStorage/sessionStorage: o token vive so na memoria da aba.
 *
 * CONSUMIDORES: pages/Home/company/Menezes22001Home.tsx (obtem o token ao abrir a Home).
 * Espelho de app/Controllers/Api/V1/Eleicoes2026/EleicoesToken/TokenController.php.
 * -------------------------------------------------------------------------
 */

import { request } from '@/services/http';
import type { QueryParams } from '@/types/api';

// Endpoints: GET /v1/eleicoes-public/token (publico) e /v1/eleicoes2026-*/... (token typ=eleicoes).

interface EleicoesTokenResponse {
  data?: { access_token?: string; expires_in?: number };
}

/** Folga antes do vencimento em que o token e renovado (ms). */
const RENEW_MARGIN_MS = 60_000;

let cachedToken: string | null = null;
let cachedUntil = 0;
let inFlight: Promise<string> | null = null;

/** Devolve o token especial das Eleicoes (do cache em memoria ou novo). */
export function getEleicoesPublicToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedUntil) return Promise.resolve(cachedToken);

  inFlight ??= request<EleicoesTokenResponse>('GET', '/v1/eleicoes-public/token', {
    // Rota publica: nao enviar o token de sessao.
    headers: { Authorization: '' },
  })
    .then((res) => {
      const token = res.data?.access_token;
      if (!token) throw new Error('Token Eleicoes ausente na resposta.');
      cachedToken = token;
      cachedUntil = Date.now() + (res.data?.expires_in ?? 0) * 1000 - RENEW_MARGIN_MS;
      return token;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** GET de um grupo eleicoes2026-* usando o token especial (sem login). */
export async function eleicoesPublicGet<T = unknown>(group: string, path: string, params?: QueryParams): Promise<T> {
  const token = await getEleicoesPublicToken();
  return request<T>('GET', `/v1/${group}/${path}`, { params, headers: { Authorization: `Bearer ${token}` } });
}
