/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/NewCommentModal.tsx
 * =========================================================================
 *
 * O QUE FAZ: modal "Novo comentário" do `PostCard` — mesma técnica do
 * `NewPostModal` (schema do `form_manager` slug `timeline-comment`, lido de
 * `view_form_manager`, montado com `FormGrid`), então o campo ganha tooltip
 * (`help_text`), validação e fake fill como qualquer form do sistema.
 * Substitui o `<textarea>` escrito à mão que ficava no PostCard (fora da
 * regra "campo renderiza por schema + FormGrid") — 2026-09-28.
 *
 * CONTEXTO VEM DO CARD: o form `timeline-comment` tem também "Publicação"
 * (`timeline_post_id`) e "Responder a" (`parent_id`) — úteis no form
 * genérico `/v1/form/timeline-comment`, mas aqui o post já é conhecido e
 * resposta encadeada não existe na Home Feed. Por isso esses campos são
 * RETIRADOS do schema só neste modal (`CONTEXT_FIELDS`) e o
 * `timeline_post_id` é injetado no payload. O cadastro no banco não muda.
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input`, `@/components/global/Modal`,
 * `@/components/global/FakeFillButton`, `@/services/formSchema`,
 * `@/services/v1` (`formManagerView`), `@/utils/{apiResult,formSubmit}`.
 * CONSUMIDORES: `pages/v1/timeline/home-feed/PostCard.tsx` (botão Comentar).
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

const FORM_SLUG = 'timeline-comment';
/** `field_name` que o card já conhece (post) ou que a Home Feed não usa (resposta encadeada). */
const CONTEXT_FIELDS = new Set(['timeline_post_id', 'parent_id']);

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

export default function NewCommentModal({
  open,
  postId,
  onClose,
  onCreated,
}: {
  open: boolean;
  postId: number;
  onClose: () => void;
  onCreated: () => void;
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
      if (typeof payload.content !== 'string' || payload.content === '') {
        toast.error('Escreva o comentário antes de enviar.', { title: 'Erro ao comentar' });
        return;
      }

      setSubmitting(true);
      try {
        await senderFor(form.meta.httpMethod)(resolveEndpoint(form.meta.submitEndpoint), payload);
        toast.success('Comentário enviado.', { title: 'Comentar' });
        el.reset();
        setReloadKey((k) => k + 1);
        onCreated();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao comentar' });
        } else {
          toast.error('Falha inesperada ao comentar.', { title: 'Erro ao comentar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, postId, toast, onCreated, onClose],
  );

  return (
    <Modal open={open} title="Novo comentário" onClose={onClose} size="sm">
      {loading && <div className="text-body-secondary">Carregando formulário…</div>}

      {error && !loading && <div className="alert alert-danger py-2">{error}</div>}

      {form && !loading && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid key={reloadKey} schema={form.schema} />
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
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
