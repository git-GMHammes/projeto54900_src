/**
 * =============================================================================
 * FILE HEADER — http (services) — wrapper único de `fetch`
 * =============================================================================
 *
 * O QUE FAZ: é o ÚNICO lugar do front que fala HTTP. Recebe método, caminho e
 *   opções e cuida de: URL base do ambiente, serialização/deserialização,
 *   cabeçalhos do projeto, token, cancelamento e normalização de erro.
 *
 * O QUE ELE GARANTE (o contrato de que os services dependem):
 *   1. URL: `env.apiBaseUrl` + caminho (com barra inicial normalizada) + query
 *      string montada por `toQueryString`;
 *   2. corpo: objeto -> JSON (`Content-Type: application/json`); `FormData`
 *      passa CRU e SEM `Content-Type` — o navegador precisa definir o boundary;
 *   3. cabeçalhos fixos: `Accept: application/json` e
 *      `X-Requested-With: XMLHttpRequest` (o nginx do projeto usa isso no
 *      tratamento de OPTIONS/CORS);
 *   4. autenticação: `Authorization: Bearer <token>` quando houver token;
 *   5. erro: SEMPRE `ApiError` (status, data, url) — nunca o `Response` cru;
 *   6. diagnóstico: toda resposta vai para `apiDebugLog` (dev-only).
 *
 * FLUXO DE UMA CHAMADA (o caminho do dado):
 *   service (`services/v1/*`) -> `http.get|post|...` (BLOCO 5)
 *     -> `request()` (BLOCO 4)
 *        -> `buildUrl` (BLOCO 3) e `fetch`
 *           -> `parseBody` (BLOCO 3): JSON ou texto
 *              -> `record` no debug log
 *                 -> sucesso: devolve o payload tipado
 *                 -> erro HTTP: lança `ApiError` (BLOCO 2), com status/data/url
 *                 -> erro de rede: lança `ApiError` sem status
 *
 * DEPENDÊNCIAS: `@/config/env` (URL base), `@/utils/querystring`
 *   (`toQueryString`), `@/services/apiDebugLog` (diagnóstico) e `@/types/api`
 *   (`ApiErrorInit`, `HttpMethod`, `QueryParams`, `RequestOptions`).
 *
 * CONSUMIDORES: `services/resourceFactory.ts` (todos os recursos) e as páginas
 *   que chamam `http` direto quando o endpoint não é padrão. `ApiError` é
 *   consumido em toda página que faz `err instanceof ApiError`.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. é o ÚNICO ponto que lê `env.apiBaseUrl` — nenhum service escreve host ou
 *      versão na mão;
 *   2. mudança aqui afeta o sistema INTEIRO: alterar cabeçalho, formato de erro
 *      ou parse exige teste em pelo menos um recurso com JSON e um com upload
 *      (`FormData`);
 *   3. `AbortError` NÃO é convertido em `ApiError` DE PROPÓSITO (BLOCO 4):
 *      cancelamento é controle de fluxo, não falha.
 * =============================================================================
 */

import { env } from '@/config/env';
import { toQueryString } from '@/utils/querystring';
import { record as recordApiDebug } from '@/services/apiDebugLog';
import type { ApiErrorInit, HttpMethod, QueryParams, RequestOptions } from '@/types/api';

/**
 * =============================================================================
 * BLOCO 1 — INJEÇÃO DO TOKEN (evita ciclo de import)
 * =============================================================================
 *
 * `getAccessToken` é um GETTER REGISTRADO DE FORA: o `AuthContext` chama
 *   `setAccessTokenGetter(...)` quando monta e passa `null` quando desmonta.
 *
 * POR QUE ASSIM (e não importar o contexto aqui): `context` -> `services` ->
 *   `context` criaria import circular. Com o getter, este arquivo não conhece o
 *   contexto — só pergunta "qual é o token agora?".
 *
 * SEM PROVIDER MONTADO (ou usuário deslogado) o getter é `null` e a requisição
 *   segue SEM `Authorization` — o mesmo caminho das chamadas públicas (login,
 *   por exemplo).
 *
 * O token é lido A CADA requisição (`getAccessToken?.()` dentro do `request`) e
 *   NÃO é guardado aqui: assim um refresh de token já vale para a próxima
 *   chamada, sem ninguém precisar avisar este módulo.
 * -------------------------------------------------------------------------
 */
let getAccessToken: (() => string | null) | null = null;

export function setAccessTokenGetter(getter: (() => string | null) | null): void {
  getAccessToken = getter;
}

/** true se há access_token na sessão agora (mesmo que o usuário não tenha sido resolvido). */
export function hasAccessToken(): boolean {
  return Boolean(getAccessToken?.());
}

/** O access_token atual (ou null) — para quem monta headers fora de `request()`, ex.: FormGrid/select. */
export function getAuthToken(): string | null {
  return getAccessToken?.() ?? null;
}

/**
 * =============================================================================
 * BLOCO 2 — `ApiError`: O ERRO TIPADO DA CAMADA
 * =============================================================================
 *
 * O QUE FAZ: é o ÚNICO erro que sai daqui. Carrega o que uma tela precisa para
 *   decidir a mensagem, sem obrigar ninguém a inspecionar `Response`:
 *   message -> texto já escolhido por `pickErrorMessage` (BLOCO 3);
 *   status  -> código HTTP (`0` quando nem chegou a haver resposta, ou seja,
 *              falha de rede);
 *   data    -> corpo parseado da resposta (útil para detalhes de validação);
 *   url     -> a URL que falhou (aparece em log/console).
 *
 * O `name` é fixado em 'ApiError' (em vez do 'Error' herdado) para o erro ficar
 *   reconhecível em log e no DevTools.
 *
 * COMO AS PÁGINAS USAM: `if (err instanceof ApiError) toast.error(err.message)`
 *   e, havendo detalhe de campo, `errorDetail(err)` (`@/utils/formSubmit`). Erro
 *   que NÃO é `ApiError` é exceção inesperada e vira mensagem genérica.
 * -------------------------------------------------------------------------
 */
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

/**
 * =============================================================================
 * BLOCO 3 — HELPERS PRIVADOS (URL, corpo e mensagem)
 * =============================================================================
 *
 * `asRecord` — estreita `unknown` para objeto. Usado antes de ler qualquer
 *   propriedade de um payload que veio de fora.
 *
 * `buildUrl(path, params)` — normaliza a barra inicial do caminho, prefixa
 *   `env.apiBaseUrl` e acrescenta `toQueryString(params)`. É o ÚNICO lugar que
 *   monta a URL final: mudar a base da API (proxy, versão) é mudar aqui.
 *
 * `parseBody(response)` — decide o que é "corpo" pelo `Content-Type`:
 *   1. se for JSON, tenta `response.json()`; JSON inválido devolve `null` em vez
 *      de estourar (resposta vazia é comum em códigos sem corpo);
 *   2. caso contrário, lê como TEXTO e devolve `null` quando vier vazio.
 *   Nunca lança: quem julga o conteúdo é o chamador, pelo status.
 *
 * `pickErrorMessage(payload, status)` — escolhe a mensagem do `ApiError` nesta
 *   ORDEM: `message` -> `error` -> `messages.error` do corpo; se nada servir, cai
 *   em "Erro <status> na API.". A ordem importa: os controllers do projeto usam
 *   `messages` para erro de validação, e o fallback garante que NUNCA falte texto
 *   para mostrar ao usuário.
 * -------------------------------------------------------------------------
 */
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

/**
 * =============================================================================
 * BLOCO 4 — `request`: A CHAMADA (a ordem das etapas é o contrato)
 * =============================================================================
 *
 * O QUE FAZ, na ordem:
 *   1. monta a URL (BLOCO 3) e detecta se o corpo é `FormData`;
 *   2. pergunta o token ao getter (BLOCO 1) e monta os cabeçalhos — `FormData`
 *      NÃO recebe `Content-Type`, porque o navegador precisa definir o boundary;
 *   3. anexa `signal` (cancelamento) e o corpo: `FormData` cruou ou
 *      `JSON.stringify`;
 *   4. `fetch` dentro de `try`: se falhar com `AbortError`, REPASSA o erro
 *      original (cancelamento é controle de fluxo — quem cancelou sabe o que
 *      fazer); qualquer outra falha vira `ApiError` de REDE, sem `status`;
 *   5. lê o corpo com `parseBody`;
 *   6. registra a resposta no debug log (`record`) ANTES de decidir
 *      sucesso/erro, para que uma chamada que falhou também apareça no painel;
 *   7. se `!response.ok`, lança `ApiError` com a mensagem de `pickErrorMessage`,
 *      mais `status`, corpo e URL;
 *   8. se deu certo, devolve o payload como `T`.
 *
 * O `T` é um CAST: o corpo vem de fora e NÃO há validação de forma aqui. Quem
 *   precisa de garantia de formato normaliza depois (`normalizeList`/
 *   `normalizeItem` em `@/utils/apiResult`).
 *
 * COMO REAPROVEITAR: para falar com outra API, copie `request` + helpers e troque
 *   `buildUrl`. NÃO duplicar este arquivo para um "caso especial": acrescente
 *   `opts` e mantenha um único caminho HTTP no projeto.
 * -------------------------------------------------------------------------
 */
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

/**
 * =============================================================================
 * BLOCO 5 — OBJETO `http` (a interface usada pelos services)
 * =============================================================================
 *
 * O QUE FAZ: expõe um atalho por verbo, todos delegando a `request` (BLOCO 4) —
 *   não há lógica aqui, só a assinatura amigável. É por este objeto que
 *   `resourceFactory.ts` e as páginas chamam a API.
 *
 * DIFERENÇA DE ASSINATURA ENTRE OS VERBOS (é intencional):
 *   `get` e `delete` recebem `(path, opts)`;
 *   `post`, `put` e `patch` recebem `(path, body, opts)` — o corpo vem ANTES das
 *     opções, porque é o argumento que o chamador costuma ter em mãos.
 *   Passar o corpo no lugar das opções compila, mas a requisição sai SEM corpo:
 *   é o erro mais comum ao acrescentar uma chamada nova. Confira a assinatura.
 *
 * O genérico `<T>` é a expectativa de formato da resposta (cast, ver BLOCO 4).
 *   Como o padrão é `unknown`, quem não declara tipo trata o retorno com
 *   cuidado — que é o desejado.
 * -------------------------------------------------------------------------
 */
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
