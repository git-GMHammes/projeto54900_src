// Formulario de envio de mensagem — build 'enviar-mensagem' (form_manager,
// tabela chat_messages). Mesmo pipeline de pages/v1/chat-rooms/chat-rooms-manager/CreatePage.tsx:
// formManagerView.getGrouped -> buildRenderSchema -> FormGrid -> submit para
// o submit_endpoint do build.
//
// Envio em duas etapas: 1) POST da mensagem (JSON, com `mentions[]` opcional);
// 2) se o campo `file` tiver arquivo, POST do anexo (multipart) com o
// chat_message_id devolvido. Se o anexo falhar, a mensagem ja existe: o erro
// e avisado e a tela segue para a lista (evita reenviar a mensagem).
//
// Edicao de mensagem existe em outra tela (UpdatePage, so admin): o usuario
// comum nao edita o conteudo; ele remove pela acao "Remover" da lista.

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { chatRoomAttachmentsUpload, formManagerView } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'enviar-mensagem';

/** Arquivo escolhido no campo `file` do FormGrid (null se vazio). */
function selectedFile(form: HTMLFormElement): File | null {
  const value = new FormData(form).get('file');
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
      const file = selectedFile(el);
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

        if (file) {
          try {
            await chatRoomAttachmentsUpload.upload({ file, chatMessageId: id });
          } catch (err) {
            const detail = err instanceof ApiError ? `${err.message}${errorDetail(err)}` : 'Falha inesperada no anexo.';
            toast.error(`A mensagem foi enviada, mas o anexo não. ${detail}`, { title: 'Anexo não enviado' });
            void navigate(paths.v1.chatMessages.list);
            return;
          }
        }

        toast.success('Mensagem enviada.', { title: form.meta.title });
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
    [form, navigate, toast],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Nova mensagem'}
        subtitle={form?.meta.description ?? 'POST api/v1/chat-messages/create'}
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
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.chatMessages.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
