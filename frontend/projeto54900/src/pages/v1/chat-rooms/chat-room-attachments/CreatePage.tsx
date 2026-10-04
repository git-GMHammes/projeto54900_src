// Formulario de envio de anexo de chat — build 'enviar-anexo-chat'
// (form_manager, tabela chat_room_attachments). Mesmo pipeline de
// pages/v1/chat-rooms/chat-messages/CreatePage.tsx: formManagerView.getGrouped
// -> buildRenderSchema -> FormGrid. DIFERENCA: o create e MULTIPART (campo
// "file" + chat_message_id), entao o envio vai por
// chatRoomAttachmentsUpload.upload e nao pelo submit JSON do build (o
// formDataToPayload ignora File). Regra de acesso (Processor): so o autor da
// mensagem ou admin anexa arquivo.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, chatRoomAttachmentsUpload } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'enviar-anexo-chat';
const FILE_FIELD = 'file';

/** O arquivo escolhido no campo de anexo, ou null (input vazio vem como File de tamanho 0). */
function pickFile(el: HTMLFormElement): File | null {
  const value = new FormData(el).get(FILE_FIELD);
  return value instanceof File && value.size > 0 ? value : null;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
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
      const file = pickFile(el);
      const chatMessageId = payload.chat_message_id;
      if (!file || (typeof chatMessageId !== 'string' && typeof chatMessageId !== 'number')) {
        toast.error('Selecione a mensagem e o arquivo.', { title: 'Dados incompletos' });
        return;
      }
      const category = typeof payload.category === 'string' ? payload.category : undefined;

      setSubmitting(true);
      try {
        const res = await chatRoomAttachmentsUpload.upload({ file, chatMessageId, category });
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Registro criado sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }
        toast.success('Anexo enviado.', { title: form.meta.title });
        void navigate(paths.v1.chatRoomAttachments.list);
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
        title={form?.meta.title ?? 'Novo anexo'}
        subtitle={form?.meta.description ?? 'POST api/v1/chat-room-attachments/create'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.chatRoomAttachments.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
