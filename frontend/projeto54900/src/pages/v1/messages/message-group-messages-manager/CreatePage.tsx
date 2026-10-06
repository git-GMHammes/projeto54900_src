// Formulario de nova mensagem de grupo — build 'criar-mensagem-grupo' (form_manager, tabela
// message_group_messages). Escolhe o grupo (select remoto, so grupos de que o usuario participa),
// o texto e, opcionalmente, o agendamento. O remetente e o usuario logado (backend); a mensagem e a
// ligacao com o grupo sao gravadas juntas. Todos os membros ativos do grupo a recebem. Message NAO e chat.
// Anexo (campo `arquivo`): gravada a mensagem, o arquivo sobe em seguida (multipart) com o id da mensagem
// (messages_manager_id da resposta); se o anexo falhar a mensagem ja existe.
// Mesmo pipeline de CreatePage de messages-manager (formManagerView -> buildRenderSchema -> FormGrid -> submit JSON).
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, messageAttachmentsUpload } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { selectedFile } from '@/utils/formFile';
import { avisoPalavrasProibidas } from '@/utils/palavrasProibidas';
import { paths } from '@/routes/paths';

const SLUG = 'criar-mensagem-grupo';

export default function CreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' });
      const built = buildRenderSchema(normalizeList(raw).rows);
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
      const blocked = avisoPalavrasProibidas(typeof payload.content === 'string' ? payload.content : '', user?.role?.slug === 'admin');
      if (blocked) {
        toast.error(blocked, { title: 'Mensagem bloqueada' });
        return;
      }
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        const res = await send(path, payload);
        const row = normalizeItem<ApiRow>(res);
        const id = row?.id;
        const messageId = row?.messages_manager_id;
        if (typeof id !== 'string' && typeof id !== 'number') {
          toast.error('Mensagem criada sem id na resposta.', { title: 'Erro ao enviar' });
          return;
        }

        if (file && (typeof messageId === 'string' || typeof messageId === 'number')) {
          try {
            await messageAttachmentsUpload.upload({ file, messageId: messageId });
          } catch (err) {
            const detail = err instanceof ApiError ? `${err.message}${errorDetail(err)}` : 'Falha inesperada no anexo.';
            toast.error(`A mensagem foi gravada, mas o anexo não. ${detail}`, { title: 'Anexo não enviado' });
            void navigate(paths.v1.messageGroupMessages.list);
            return;
          }
        }

        toast.success('Mensagem enviada ao grupo.', { title: form.meta.title });
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
    [form, navigate, toast, user],
  );

  return (
    <>
      <PageHeader
        title={form?.meta.title ?? 'Nova Mensagem de Grupo'}
        subtitle={form?.meta.description ?? 'POST api/v1/message-group-messages/create'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
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
