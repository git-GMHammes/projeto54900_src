// Helpers de submit de formulario dinamico (schema vindo de form_manager),
// compartilhados por qualquer pagina que envie um <FormGrid> para a API.
// Extraido de FormRendererPage.tsx (unico consumidor original) para reuso
// sem duplicar (ex.: pages/v1/user/register/RegisterPage.tsx).

import { env } from '@/config/env';
import { http } from '@/services/http';
import type { ApiError } from '@/services/http';

// O submit_endpoint do banco vem como "/api/v1/...". O wrapper http ja prefixa
// env.apiBaseUrl, que muda por ambiente (ex.: "/api" em dev, ou
// "/projeto54900/public/api" em subpasta). Entao removemos, nesta ordem:
// 1) a base configurada (relativa ou URL absoluta com host), quando presente;
// 2) o prefixo "/api" do contrato do banco, que e fixo e independe do host.
// Sem o passo 2, uma base diferente de "/api" gerava ".../api/api/v1/...".
export function resolveEndpoint(raw: string): string {
  let p = raw.trim();
  const base = env.apiBaseUrl;
  if (base && p.startsWith(`${base}/`)) p = p.slice(base.length);
  else if (base && p === base) p = '/';
  if (/^https?:\/\//i.test(p)) p = p.replace(/^https?:\/\/[^/]+/i, '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p === '/api') return '/';
  if (p.startsWith('/api/')) p = p.slice('/api'.length);
  return p;
}

export function senderFor(method: string): (path: string, body: unknown) => Promise<unknown> {
  if (method === 'PUT') return (p, b) => http.put(p, b);
  if (method === 'PATCH') return (p, b) => http.patch(p, b);
  return (p, b) => http.post(p, b);
}

// Sentinela para "campo select opcional limpo de propósito" (botão ✕ do
// FormGrid/select). Um <input type="hidden"> vazio de um campo NUNCA TOCADO
// (create, ou edit sem mudança) e um campo EXPLICITAMENTE LIMPO (edit, X
// clicado) são indistinguíveis em HTML puro — os dois viram value=''. Sem
// essa distinção, formDataToPayload omitia a chave nos dois casos, e o
// backend (BaseViewService::sanitizeData) também descarta null/'' — logo um
// FK opcional (ex.: menu_manager.parent_id) nunca podia ser zerado via PUT
// update. O componente SelectField (FormGrid/select/index.tsx) escreve esse
// valor no hidden input só quando o usuário clica no ✕; aqui viramos null
// de verdade no payload, em vez de omitir. Ver BaseViewService::sanitizeData
// (só descarta '', preserva null explícito).
export const CLEARED_FIELD_VALUE = '@@cleared@@';

// FormData -> corpo JSON. Chaves "campo[]" (checkbox multiplo) viram array;
// escalares viram string; vazios sao omitidos (a API e permit_empty);
// CLEARED_FIELD_VALUE vira null explicito (ver acima). Checkbox de opcao
// unica (1 so <input> com aquele name[]) e booleano: vai como escalar ("1"),
// e desmarcado com valor "1" vai "0" — sem isso a API recebe ["1"] e reprova
// `in_list[0,1]`, e um default 1 nunca vira 0.
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

    if (value === CLEARED_FIELD_VALUE) {
      payload[rawKey] = null;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed !== '') payload[rawKey] = trimmed;
  }

  for (const [key, list] of Object.entries(arrays)) {
    if (list.length > 0) payload[key] = list;
  }

  // Checkbox booleano: um unico input por name[] no formulario.
  const checkboxes = new Map<string, HTMLInputElement[]>();
  for (const input of form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name$="[]"]')) {
    const key = input.name.slice(0, -2);
    const list = checkboxes.get(key) ?? [];
    list.push(input);
    checkboxes.set(key, list);
  }
  for (const [key, inputs] of checkboxes) {
    const only = inputs.length === 1 ? inputs[0] : undefined;
    if (!only || only.disabled) continue;
    if (only.checked) payload[key] = only.value;
    else if (only.value === '1') payload[key] = '0';
  }

  return payload;
}

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
