// Formulario de novo grupo — build 'criar-grupo-mensagem' (form_manager, tabela
// message_groups_manager). Traz quase todas as colunas: dono (vem com o usuario
// logado; so admin troca), status (padrao Ativo), nome e descricao. O dono entra como
// membro (backend). Message NAO e chat.
// Mesmo pipeline de CreatePage de messages-manager (formManagerView ->
// buildRenderSchema -> FormGrid -> submit JSON).
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues, patchFields } from '@/utils/formSchemaPatch';
import { paths } from '@/routes/paths';

const SLUG = 'criar-grupo-mensagem';

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'admin';
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const schema = useMemo(() => {
    if (!form) return null;
    const me = user ? String(user.id) : '';
    const filled = fillValues(form.schema, { owner_user_manager_id: me, status: 'active' });

    return patchFields(filled, { owner_user_manager_id: isAdmin ? {} : { disabled: true } });
  }, [form, user, isAdmin]);

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
        const res = await send(path, payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Registro criado sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }

        toast.success('Grupo criado.', { title: form.meta.title });
        void navigate(paths.v1.messageGroupsManager.list);
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

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Novo Grupo'}
        subtitle={form?.meta.description ?? 'POST api/v1/message-groups-manager/create'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && schema && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.messageGroupsManager.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
