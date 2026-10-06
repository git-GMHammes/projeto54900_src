// Formulario de edicao de mensagem de grupo — build 'editar-mensagem-grupo' (form_manager, tabela
// message_group_messages). O :id e o da LIGACAO mensagem-grupo; o registro vem da view
// (message-group-messages-view/get). O grupo fica travado (nao muda). AREA ADMINISTRATIVA IRRESTRITA:
// texto e data de envio editaveis em qualquer status (a regra "so agendada" e do MODO CHAT). Quem
// pode editar (remetente ou admin) e decidido pelo backend (403 vira toast).
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, messageAttachmentsUpload, messageGroupMessagesView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues, patchFields } from '@/utils/formSchemaPatch';
import { selectedFile } from '@/utils/formFile';
import MessageAttachmentCurrent from '../MessageAttachmentCurrent';
import { avisoPalavrasProibidas } from '@/utils/palavrasProibidas';
import { paths } from '@/routes/paths';

const SLUG = 'editar-mensagem-grupo';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Id da MENSAGEM (messages_manager) dona do anexo; o :id da rota e o da ligacao mensagem-grupo.
  const [messageId, setMessageId] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [formRaw, recordRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        messageGroupMessagesView.get(id),
      ]);
      const built = buildRenderSchema(normalizeList(formRaw).rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      const record = normalizeItem<ApiRow>(recordRaw);
      if (!record) {
        setForm(null);
        setError('Mensagem de grupo não encontrada.');
        return;
      }
      const values: Record<string, string> = {
        message_groups_manager_id: toText(record.mgl_message_groups_manager_id, ''),
        content: toText(record.mm_content, ''),
        scheduled_at: toText(record.mm_scheduled_at, ''),
      };
      // O grupo nunca muda; o resto fica editavel em qualquer status.
      const schema = patchFields(fillValues(built.schema, values), {
        message_groups_manager_id: { disabled: true },
      });
      setMessageId(toText(record.mgl_messages_manager_id, ''));
      setForm({ meta: built.meta, schema });
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
      const file = selectedFile(el);
      const blocked = avisoPalavrasProibidas(typeof payload.content === 'string' ? payload.content : '', user?.role?.slug === 'admin');
      if (blocked) {
        toast.error(blocked, { title: 'Mensagem bloqueada' });
        return;
      }
      const send = senderFor(form.meta.httpMethod);
      const path = `${resolveEndpoint(form.meta.submitEndpoint)}/${id}`;

      setSubmitting(true);
      try {
        await send(path, payload);
        if (file && messageId !== '') {
          try {
            await messageAttachmentsUpload.upload({ file, messageId: messageId, replace: true });
          } catch (err) {
            const detail = err instanceof ApiError ? `${err.message}${errorDetail(err)}` : 'Falha inesperada no anexo.';
            toast.error(`A mensagem foi gravada, mas o anexo não. ${detail}`, { title: 'Anexo não enviado' });
            void navigate(paths.v1.messageGroupMessages.list);
            return;
          }
        }

        toast.success('Mensagem de grupo atualizada.', { title: form.meta.title });
        void navigate(paths.v1.messageGroupMessages.list);
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
    [form, id, messageId, navigate, toast, user],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? `Editar mensagem de grupo #${id ?? ''}`}
        subtitle={form?.meta.description || 'PUT api/v1/message-group-messages/update'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <MessageAttachmentCurrent messageId={messageId} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.messageGroupMessages.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
