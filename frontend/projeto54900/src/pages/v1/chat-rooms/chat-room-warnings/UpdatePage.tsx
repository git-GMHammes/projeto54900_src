// Formulario de edicao de advertencia — build 'editar-advertencia' (form_manager,
// tabela chat_room_warnings). Só admin. Só a palavra registrada é editável; sala,
// usuário e mensagem ficam como estão (o backend os descarta no update).
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
import { formManagerView, chatRoomWarningsTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList, normalizeItem } from '@/utils/apiResult';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paths } from '@/routes/paths';

const SLUG = 'editar-advertencia';

// Preenche defaultValue dos campos cujo nome (field.name) bate com uma coluna
// do registro pre-carregado. Select (status) recebe values; texto/textarea
// recebem defaultValue; demais tipos ficam como estao.
function prefillFromRecord(schema: FormGridSchema, values: Record<string, string>): FormGridSchema {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((f) => {
        const value = f.name ? values[f.name] : undefined;
        if (value === undefined) return f;
        if (f.type === 'select') return { ...f, defaultValue: value, values: [value] };
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
      const [formRaw, recordRaw] = await Promise.all([
        formManagerView.getGrouped({ fm_slug: [SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' }),
        chatRoomWarningsTable.get(id),
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
        setError('Advertência não encontrada.');
        return;
      }
      const values: Record<string, string> = {
        flagged_word: toText(record.flagged_word, ''),
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
        toast.success('Advertência atualizada.', { title: form.meta.title });
        void navigate(paths.v1.chatRoomWarnings.list);
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
        title={form?.meta.title ?? `Editar advertência #${id ?? ''}`}
        subtitle={form?.meta.description || 'PUT api/v1/chat-room-warnings/update'}
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
            <button type="button" className="btn btn-outline-secondary" onClick={() => void navigate(paths.v1.chatRoomWarnings.list)}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </>
  );
}
