// Formulario de edicao de usuario — build 'atualizar-usuario' (form_manager
// id 6): username, status, papel (user_role_id) e troca opcional de senha.
// Mesmo pipeline de CreatePage.tsx (formManagerView.getGrouped ->
// buildRenderSchema -> FormGrid), mais o preload via userManagerView.get(id)
// (view_user_manager, colunas com prefixo um_) para pre-preencher os campos.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, userManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'atualizar-usuario';

// Preenche defaultValue dos campos de texto/senha cujo nome bate com uma
// chave do registro pre-carregado (username/status) — nao mexe no que nao
// tiver valor correspondente (ex.: password_hash fica em branco de proposito).
function prefillFromRecord(schema: FormGridSchema, values: Record<string, string>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const value = f.name ? values[f.name] : undefined;
        if (value === undefined) return f;
        if (f.type !== undefined && f.type !== 'text' && f.type !== 'password' && f.type !== 'select') return f;
        return { ...f, defaultValue: value, values: [value] };
      }),
    })),
  };
}

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [formRaw, userRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        userManagerView.get(id),
      ]);
      const { rows } = normalizeList(formRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      const user = normalizeItem<ApiRow>(userRaw);
      const prefilled = user
        ? prefillFromRecord(built.schema, {
            username: toText(user.um_username, ''),
            status: toText(user.um_status, ''),
            user_role_id: toText(user.um_user_role_id, ''),
          })
        : built.schema;
      setForm({ meta: built.meta, schema: prefilled });
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = event.currentTarget;
      if (!el.checkValidity() || !id) {
        el.reportValidity();
        return;
      }
      if (!form?.meta.submitEndpoint) {
        toast.error('Formulario sem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = `${resolveEndpoint(form.meta.submitEndpoint)}/${id}`;

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Usuario atualizado.', { title: form.meta.title });
        void navigate(paths.v1.user.view(id));
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
    [form, id, navigate, toast],
  );

  return (
    <>
      <PageHeader title={form?.meta.title ?? `Editar usuario #${id ?? ''}`} subtitle="PUT api/v1/user-manager/update" />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
