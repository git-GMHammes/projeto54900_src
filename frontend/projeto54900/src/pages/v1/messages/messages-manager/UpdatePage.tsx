// Formulario de edicao de mensagem — build 'editar-mensagem-direta' (form_manager,
// tabela messages_manager). Traz todas as colunas do cadastro, preenchidas com o
// registro. Quem nao e admin so edita texto e data de envio, e so enquanto a mensagem
// esta agendada (campos travados na tela; o backend recusa com 409/403). Remetente,
// destinatario, "Enviada em" e "Lida em" so o admin altera.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, messagesManagerTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { fillValues, patchFields } from '@/utils/formSchemaPatch';
import { paths } from '@/routes/paths';

const SLUG = 'editar-mensagem-direta';

export default function UpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'admin';
  const [form, setForm] = useState<RenderForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Remetente e destinatario nunca podem ser a mesma pessoa (so o admin os altera):
  // cada select bloqueia, na propria lista, quem esta escolhido no outro.
  const [senderId, setSenderId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [formRaw, recordRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        messagesManagerTable.get(id),
      ]);
      const { rows } = normalizeList(formRaw);
      const built = buildRenderSchema(rows);
      if (!built) {
        setForm(null);
        setError(`Formulario "${SLUG}" nao esta publicado.`);
        return;
      }
      const record = normalizeItem<ApiRow>(recordRaw);
      if (!record) {
        setForm(null);
        setError('Mensagem não encontrada.');
        return;
      }
      const values: Record<string, string> = {
        sender_user_manager_id: toText(record.sender_user_manager_id, ''),
        recipient_user_manager_id: toText(record.recipient_user_manager_id, ''),
        content: toText(record.content, ''),
        status: toText(record.status, ''),
        scheduled_at: toText(record.scheduled_at, ''),
        sent_at: toText(record.sent_at, ''),
        read_at: toText(record.read_at, ''),
      };
      // Nao-admin: so texto/data de envio e so enquanto agendada; o resto fica travado.
      const locked = isAdmin ? {} : { disabled: true };
      const textLocked = isAdmin || values.status === 'scheduled' ? {} : { disabled: true };
      const schema = patchFields(fillValues(built.schema, values), {
        sender_user_manager_id: locked,
        recipient_user_manager_id: locked,
        sent_at: locked,
        read_at: locked,
        content: textLocked,
        scheduled_at: textLocked,
      });
      setSenderId(values.sender_user_manager_id ?? '');
      setRecipientId(values.recipient_user_manager_id ?? '');
      setForm({ meta: built.meta, schema });
    } catch (err) {
      setForm(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const schema = useMemo(
    () =>
      form
        ? patchFields(form.schema, {
            sender_user_manager_id: {
              onChange: (value: string) => setSenderId(value),
              disabledValues: recipientId ? [recipientId] : [],
            },
            recipient_user_manager_id: {
              onChange: (value: string) => setRecipientId(value),
              disabledValues: senderId ? [senderId] : [],
            },
          })
        : null,
    [form, senderId, recipientId],
  );

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
        void navigate(paths.v1.messagesManager.list);
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
        subtitle={form?.meta.description || 'PUT api/v1/messages-manager/update'}
      />

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Formulario indisponivel" description={error} variant="danger" />}

      {!loading && !error && form && schema && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.messagesManager.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
