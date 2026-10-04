// Formulario de edicao do conteudo de uma mensagem — build 'editar-mensagem'
// (form_manager, tabela chat_messages). Mesmo pipeline de
// pages/v1/chat-rooms/chat-rooms-manager/UpdatePage.tsx: formManagerView ->
// buildRenderSchema -> FormGrid, com preload de chatMessagesTable.get(id).
//
// Só admin chega aqui (a ação "Editar" da listagem é restrita a admin, e o
// backend recusa content de quem não é admin com 403). O campo editável é
// só `content`; o texto anterior vai para chat_message_edits no backend.

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
import { formManagerView, chatMessagesTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'editar-mensagem';

// Preenche defaultValue do campo cujo nome (field.name) bate com uma coluna
// do registro pré-carregado. Só textarea/texto recebem valor aqui.
function prefillFromRecord(schema: FormGridSchema, values: Record<string, string>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const value = f.name ? values[f.name] : undefined;
        if (value === undefined) return f;
        if (f.type === undefined || f.type === 'text' || f.type === 'textarea') {
          return { ...f, defaultValue: value };
        }
        return f;
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
      const [formRaw, messageRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        chatMessagesTable.get(id),
      ]);
      const { rows } = normalizeList(formRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      const message = normalizeItem<ApiRow>(messageRaw);
      if (!message) {
        setForm(null);
        setError('Mensagem nao encontrada.');
        return;
      }
      const values: Record<string, string> = {
        content: toText(message.content, ''),
      };
      setForm({ meta: built.meta, schema: prefillFromRecord(built.schema, values) });
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
        toast.success('Mensagem atualizada.', { title: form.meta.title });
        void navigate(paths.v1.chatMessages.list);
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
      <PageHeader
        title={form?.meta.title ?? `Editar mensagem #${id ?? ''}`}
        subtitle={form?.meta.description || 'PUT api/v1/chat-messages/update'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.chatMessages.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
