/**
 * =========================================================================
 * FILE HEADER — utils/formSubmit.ts
 * =========================================================================
 *
 * PROPOSITO: helpers de submit de formulario dinamico (schema vindo de
 * form_manager), compartilhados por qualquer pagina que envie um
 * <FormGrid> para a API — resolver o endpoint gravado no banco, escolher o
 * metodo HTTP certo, converter o <form> do DOM em payload JSON e extrair
 * mensagens de erro de validacao da API. Extraido de FormRendererPage.tsx
 * (consumidor original) para reuso sem duplicar
 * (pages/v1/user/register/RegisterPage.tsx).
 *
 * DEPENDENCIAS: config/env (env.apiBaseUrl) e services/http (http.put/patch/post,
 * tipo ApiError).
 * CONSUMIDORES: pages/v1/form/FormRendererPage.tsx (renderiza e submete
 * QUALQUER formulario publicado) e pages/v1/user/register/RegisterPage.tsx
 * (os 2 cards do wizard de cadastro).
 *
 * COMO REAPROVEITAR EM OUTRA PAGINA COM <FormGrid>: no onSubmit do <form>,
 * chamar formDataToPayload(event.currentTarget) para montar o corpo,
 * resolveEndpoint(meta.submitEndpoint) + senderFor(meta.httpMethod) para
 * saber para onde e como enviar, e errorDetail(err) para compor a mensagem
 * de erro do toast a partir de err.data.errors.
 * -------------------------------------------------------------------------
 */

import { env } from '@/config/env';
import { http } from '@/services/http';
import type { ApiError } from '@/services/http';

/**
 * Remove o prefixo de base da API de um submit_endpoint gravado no banco.
 * O submit_endpoint vem como "/api/v1/...", mas o wrapper http.ts ja
 * prefixa env.apiBaseUrl ("/api") em toda chamada — sem essa remocao o
 * prefixo seria duplicado na URL final.
 * @param raw valor de meta.submitEndpoint (form_manager.submit_endpoint)
 */
export function resolveEndpoint(raw: string): string {
  let p = raw.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  const base = env.apiBaseUrl;
  if (base && (p === base || p.startsWith(`${base}/`))) p = p.slice(base.length) || '/';
  return p;
}

/**
 * Escolhe a funcao de envio (PUT/PATCH/POST) a partir do httpMethod gravado
 * no form_manager, com POST como default.
 * @param method meta.httpMethod (ex.: form_manager.http_method)
 */
export function senderFor(method: string): (path: string, body: unknown) => Promise<unknown> {
  if (method === 'PUT') return (p, b) => http.put(p, b);
  if (method === 'PATCH') return (p, b) => http.patch(p, b);
  return (p, b) => http.post(p, b);
}

/**
 * Converte o FormData do submit num objeto plano para o service de escrita.
 * Chaves "campo[]" (checkbox multiplo) viram array; escalares viram string
 * trimada; chaves vazias sao omitidas (a API e permit_empty, entao omitir
 * evita sobrescrever um valor existente com string vazia no update).
 * @param form elemento <form> do evento de submit (event.currentTarget)
 * @returns payload pronto para JSON.stringify/enviar via http.ts
 */
export function formDataToPayload(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const payload: Record<string, unknown> = {};
  const arrays: Record<string, string[]> = {};

  for (const [rawKey, value] of fd.entries()) {
    if (typeof value !== 'string') continue;

    if (rawKey.endsWith('[]')) {
      const key = rawKey.slice(0, -2);
      (arrays[key] ??= []).push(value);
      continue;
    }

    const trimmed = value.trim();
    if (trimmed !== '') payload[rawKey] = trimmed;
  }

  for (const [key, list] of Object.entries(arrays)) {
    if (list.length > 0) payload[key] = list;
  }

  return payload;
}

/**
 * Extrai as mensagens de validacao de um ApiError (err.data.errors, mapa
 * campo -> mensagem) e as junta num sufixo pronto para concatenar na
 * mensagem de erro exibida no toast.
 * @param err erro capturado do catch de uma chamada http.ts
 * @returns " — msg1 | msg2" (com o separador " — " embutido) ou '' se nao houver detalhe
 */
export function errorDetail(err: ApiError): string {
  const bag =
    err.data && typeof err.data === 'object'
      ? (err.data as Record<string, unknown>).errors
      : null;
  const msgs =
    bag && typeof bag === 'object'
      ? Object.values(bag as Record<string, unknown>).filter(
        (v): v is string => typeof v === 'string',
      )
      : [];
  return msgs.length > 0 ? ` — ${msgs.join(' | ')}` : '';
}
