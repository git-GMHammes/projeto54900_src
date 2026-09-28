/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/NewReportModal.tsx
 * =========================================================================
 *
 * O QUE FAZ: modal de DENÚNCIA de uma publicação, aberto pelo ícone de
 * bandeira do `PostCard` — o usuário continua no feed (regra do projeto:
 * ação dentro da tela é modal, nunca link para outra página). Mesmo padrão
 * do `NewCommentModal.tsx`: schema do `form_manager` slug `timeline-report`
 * (lido de `view_form_manager`) montado com `FormGrid`.
 *
 * CAMPOS (2026-09-28): "Motivo*" (`reason`, RADIO obrigatório — 8 opções do
 * enum de `timeline_post_reports.reason`) e "Detalhes" (`description`,
 * textarea opcional). O campo "Publicação" (`timeline_post_id`) EXISTE no
 * form — a página admin `/v1/form/timeline-report` usa — mas é removido aqui
 * (`withoutContextFields`): o id vem do card (`postId`) e é injetado no
 * payload.
 *
 * ENVIO: `submit_endpoint` do form (`POST /api/v1/timeline-post-reports/create`).
 * Denúncia repetida do mesmo usuário é barrada pela UNIQUE KEY no backend — o
 * toast mostra a mensagem da API. Sucesso -> `onReported()` (a página tira o
 * card do feed: denunciado nunca é exibido) e fecha.
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input`, `@/components/global/Modal`,
 * `@/components/global/FakeFillButton`, `@/services/formSchema`,
 * `@/services/v1` (`formManagerView`), `@/utils/{apiResult,formSubmit}`.
 * CONSUMIDORES: `pages/v1/timeline/home-feed/PostCard.tsx`.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

const FORM_SLUG = 'timeline-report';
/** `field_name` que o card já conhece (o post denunciado). */
const CONTEXT_FIELDS = new Set(['timeline_post_id']);

/** Tira do schema os campos de contexto; linha que ficar vazia some junto. */
function withoutContextFields(schema: RenderForm['schema']): RenderForm['schema'] {
  return {
    rows: schema.rows
      .map((row) => ({
        ...row,
        fields: row.fields.filter((field) => !CONTEXT_FIELDS.has((field as { name?: string }).name ?? '')),
      }))
      .filter((row) => row.fields.length > 0),
  };
}

export default function NewReportModal({
  open,
  postId,
  onClose,
  onReported,
}: {
  open: boolean;
  postId: number;
  onClose: () => void;
  onReported: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setError(null);

    formManagerView
      .getGrouped({ fm_slug: [FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        if (!active) return;
        const built = buildRenderSchema(normalizeList(raw).rows);
        if (!built) {
          setForm(null);
          setError(`Formulário '${FORM_SLUG}' não encontrado.`);
          return;
        }
        setForm({ ...built, schema: withoutContextFields(built.schema) });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setForm(null);
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulário não tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload: Record<string, unknown> = { ...formDataToPayload(el), timeline_post_id: postId };
      if (typeof payload.reason !== 'string' || payload.reason === '') {
        toast.error('Escolha o motivo da denúncia.', { title: 'Erro ao denunciar' });
        return;
      }

      setSubmitting(true);
      try {
        await senderFor(form.meta.httpMethod)(resolveEndpoint(form.meta.submitEndpoint), payload);
        toast.success('Denúncia enviada. A publicação foi ocultada do seu feed.', { title: 'Denunciar' });
        el.reset();
        setReloadKey((k) => k + 1);
        onClose();
        onReported();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao denunciar' });
        } else {
          toast.error('Falha inesperada ao denunciar.', { title: 'Erro ao denunciar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, postId, toast, onReported, onClose],
  );

  return (
    <Modal open={open} title="Denunciar publicação" onClose={onClose} size="sm">
      {loading && <div className="text-body-secondary">Carregando formulário…</div>}

      {error && !loading && <div className="alert alert-danger py-2">{error}</div>}

      {form && !loading && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid key={reloadKey} schema={form.schema} />
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Denunciar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {open && form && !loading && isFormPublished(form) && <FakeFillButton slug={FORM_SLUG} />}
    </Modal>
  );
}
