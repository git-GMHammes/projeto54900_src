// Renderizador de formulario — le a definicao de um form_manager pela slug da
// URL (/v1/form/:slug), monta UM formulario com <FormGrid> a partir da
// view_form_manager e submete para o endpoint / metodo gravados no registro.
//
// Irmao de FormConstructorPage (/v1/form-constructor-claude): mesmo pipeline
// get-grouped -> formSchema -> FormGrid, aqui generico e dirigido pelos dados.
// Alvo inicial: slug "calendario" -> POST /api/v1/calendars/create (modulo
// Agenda do Google / Google Calendars).

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError, http } from '@/services/http';
import { env } from '@/config/env';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { paths } from '@/routes/paths';

// O submit_endpoint do banco vem como "/api/v1/...". O wrapper http ja prefixa
// env.apiBaseUrl ("/api"), entao removemos esse prefixo antes de chamar.
function resolveEndpoint(raw: string): string {
  let p = raw.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  const base = env.apiBaseUrl;
  if (base && (p === base || p.startsWith(`${base}/`))) p = p.slice(base.length) || '/';
  return p;
}

function senderFor(method: string): (path: string, body: unknown) => Promise<unknown> {
  if (method === 'PUT') return (p, b) => http.put(p, b);
  if (method === 'PATCH') return (p, b) => http.patch(p, b);
  return (p, b) => http.post(p, b);
}

// FormData -> corpo JSON. Chaves "campo[]" (checkbox multiplo) viram array;
// escalares viram string; vazios sao omitidos (a API e permit_empty).
function formDataToPayload(form: HTMLFormElement): Record<string, unknown> {
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

function errorDetail(err: ApiError): string {
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

export default function FormRendererPage() {
  const { slug = '' } = useParams();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [slug] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Nenhum formulario publicado para a slug "${slug}".`);
        return;
      }
      setForm(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Registro enviado.', { title: form.meta.title });
        el.reset();
        setReloadKey((k) => k + 1);
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, toast],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Formulario'}
        subtitle={form?.meta.description ?? `slug: ${slug}`}
      >
        <Link className="btn btn-outline-secondary me-2" to={paths.v1.form.list}>
          Voltar
        </Link>
        <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && form && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            {form.meta.status && form.meta.status !== 'active' && (
              <div className="alert alert-warning py-2">
                Formulario com status <strong>{form.meta.status}</strong> — ainda nao publicado.
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <FormGrid key={reloadKey} schema={form.schema} />
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
                <button type="reset" className="btn btn-outline-secondary">
                  Limpar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
