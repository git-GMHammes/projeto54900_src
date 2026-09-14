// Wrapper unico de HTTP (fetch). Todos os services passam por aqui.
// - Prefixa env.apiBaseUrl.
// - Serializa/deserializa JSON (e suporta FormData sem tocar no Content-Type).
// - Normaliza erro em ApiError.
// - Envia X-Requested-With (o nginx do projeto trata OPTIONS/CORS).

import { env } from '@/config/env';
import { toQueryString } from '@/utils/querystring';
import { record as recordApiDebug } from '@/services/apiDebugLog';
import type { ApiErrorInit, HttpMethod, QueryParams, RequestOptions } from '@/types/api';

// Getter registrado pelo AuthContext (evita import circular services <-> context).
// Sem provider montado (ou usuario deslogado), getAccessToken() e null — chamadas
// continuam exatamente como hoje, sem header Authorization.
let getAccessToken: (() => string | null) | null = null;

export function setAccessTokenGetter(getter: (() => string | null) | null): void {
  getAccessToken = getter;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly url: string;

  constructor(message: string, init: ApiErrorInit = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = init.status ?? 0;
    this.data = init.data ?? null;
    this.url = init.url ?? '';
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

function buildUrl(path: string, params?: QueryParams): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiBaseUrl}${clean}${toQueryString(params)}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const ct = response.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try {
      return (await response.json()) as unknown;
    } catch {
      return null;
    }
  }
  const text = await response.text();
  return text || null;
}

function pickErrorMessage(payload: unknown, status: number): string {
  const record = asRecord(payload);
  const candidate =
    record?.message ?? record?.error ?? asRecord(record?.messages)?.error;
  return typeof candidate === 'string' && candidate ? candidate : `Erro ${status} na API.`;
}

export async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  { params, body, headers, signal }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, params);
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = getAccessToken?.() ?? null;

  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(isForm ? {} : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (signal) init.signal = signal;
  if (body !== undefined) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    throw new ApiError('Falha de rede ao contatar a API.', { url });
  }

  const payload = await parseBody(response);

  recordApiDebug({
    method,
    path: url,
    status: response.status,
    ok: response.ok,
    payload,
  });

  if (!response.ok) {
    throw new ApiError(pickErrorMessage(payload, response.status), {
      status: response.status,
      data: payload,
      url,
    });
  }

  return payload as T;
}

export const http = {
  get: <T = unknown>(path: string, opts?: RequestOptions): Promise<T> =>
    request<T>('GET', path, opts),
  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('POST', path, { ...opts, body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T = unknown>(path: string, opts?: RequestOptions): Promise<T> =>
    request<T>('DELETE', path, opts),
};
