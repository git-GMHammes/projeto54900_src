// Helpers de submit de formulario dinamico (schema vindo de form_manager),
// compartilhados por qualquer pagina que envie um <FormGrid> para a API.
// Extraido de FormRendererPage.tsx (unico consumidor original) para reuso
// sem duplicar (ex.: pages/v1/user/register/RegisterPage.tsx).

import { env } from '@/config/env';
import { http } from '@/services/http';
import type { ApiError } from '@/services/http';

// O submit_endpoint do banco vem como "/api/v1/...". O wrapper http ja prefixa
// env.apiBaseUrl ("/api"), entao removemos esse prefixo antes de chamar.
export function resolveEndpoint(raw: string): string {
  let p = raw.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  const base = env.apiBaseUrl;
  if (base && (p === base || p.startsWith(`${base}/`))) p = p.slice(base.length) || '/';
  return p;
}

export function senderFor(method: string): (path: string, body: unknown) => Promise<unknown> {
  if (method === 'PUT') return (p, b) => http.put(p, b);
  if (method === 'PATCH') return (p, b) => http.patch(p, b);
  return (p, b) => http.post(p, b);
}

// FormData -> corpo JSON. Chaves "campo[]" (checkbox multiplo) viram array;
// escalares viram string; vazios sao omitidos (a API e permit_empty).
// Checkbox de opcao unica (1 so <input> com aquele name[]) e booleano: vai
// como escalar ("1"), e desmarcado com valor "1" vai "0" — sem isso a API
// recebe ["1"] e reprova `in_list[0,1]`, e um default 1 nunca vira 0.
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
