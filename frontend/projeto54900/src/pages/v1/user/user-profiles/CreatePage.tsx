// Formulario de dados do usuario — ETAPA 2 (build 'dados-do-usuario', tabela
// user_profiles). Le ?user_manager_id= da querystring (vem da etapa 1,
// pages/v1/user/user-manager/CreatePage.tsx), pre-preenche o campo FK
// obrigatorio (read-only), gera o uuid no frontend (campo hidden no build,
// form_fields.is_hidden=1 — o input segue no <form> e vai no payload) e
// submete. Ao concluir, manda para /v1/login.
// Mesmo pipeline de FormRendererPage.tsx: formManagerView.getGrouped ->
// buildRenderSchema -> FormGrid -> submit para o submit_endpoint do build.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'dados-do-usuario';
const FK_FIELD = 'user_manager_id';
const UUID_FIELD = 'uuid';

// UUID v4 nativo. crypto.randomUUID so existe em contexto seguro (https ou
// localhost) — fallback com getRandomValues para dev acessado por IP via http.
function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function prefillReadOnlyField(schema: FormGridSchema, fieldName: string, value: string): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        if (f.name !== fieldName) return f;
        if (f.type !== undefined && f.type !== 'text' && f.type !== 'password') return f;
        return { ...f, defaultValue: value, readOnly: true };
      }),
    })),
  };
}

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const userManagerId = searchParams.get('user_manager_id');

  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Gerado uma vez por carregamento da tela — re-render nao troca o valor.
  const [uuid] = useState(generateUuid);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      setForm(built);
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
      if (!form?.meta.submitEndpoint) {
        toast.error('Formulario sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Cadastro concluido.', { title: form.meta.title });
        void navigate(paths.v1.auth.login);
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
    [form, navigate, toast],
  );

  const schema =
    form && userManagerId
      ? prefillReadOnlyField(prefillReadOnlyField(form.schema, FK_FIELD, userManagerId), UUID_FIELD, uuid)
      : form?.schema;

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Dados do usuario'}
        subtitle={form?.meta.description ?? 'POST api/v1/user-profiles/create'}
      />

      {loading && <LoadingOverlay />}

      {!loading && !userManagerId && (
        <EmptyState
          title="Falta o usuario de origem"
          description="Esta tela precisa de ?user_manager_id= na URL — venha pelo passo 1 (Novo usuario)."
        />
      )}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && userManagerId && form && schema && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Concluir cadastro'}
            </button>
          </div>
        </form>
      )}

      {!loading && !error && userManagerId && form && <FakeFillButton slug={SLUG} />}
    </>
  );
}
