/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/NewPostModal.tsx
 * =========================================================================
 *
 * O QUE FAZ: modal do botão flutuante de novo post da Home Feed — reaproveita
 * a MESMA técnica de `pages/v1/form/FormRendererPage.tsx` (schema do
 * `form_manager` slug `timeline-post`, lido de `view_form_manager`, montado
 * com `FormGrid`), mas embutido nesta tela em vez de navegar para
 * `/v1/form/timeline-post`. Ao publicar com sucesso, fecha o modal e avisa a
 * página (`onCreated`) para recarregar o feed.
 *
 * LACUNA CONHECIDA (mesma do formulário genérico, não é regressão desta
 * modal): sem campo de anexo — o `FormGrid` não tem `field_type` de arquivo
 * e a rota de upload de `timeline_post_attachments` ainda não está ligada no
 * back-end (ver README_modulo_timeline.md, Fase 3b).
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input`, `@/components/global/Modal`,
 * `@/services/formSchema` (`buildRenderSchema`, `isFormPublished`),
 * `@/services/v1` (`formManagerView`), `@/utils/{apiResult,formSubmit}`.
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx` (botão
 * flutuante).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

const FORM_SLUG = 'timeline-post';

export default function NewPostModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
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
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        if (!built) {
          setForm(null);
          setError(`Formulário '${FORM_SLUG}' não encontrado.`);
          return;
        }
        setForm(built);
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
      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Publicação criada.', { title: 'Novo post' });
        el.reset();
        setReloadKey((k) => k + 1);
        onCreated();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao publicar' });
        } else {
          toast.error('Falha inesperada ao publicar.', { title: 'Erro ao publicar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, toast, onCreated, onClose],
  );

  return (
    <Modal open={open} title="Nova publicação" onClose={onClose} size="lg">
      {loading && <div className="text-body-secondary">Carregando formulário…</div>}

      {error && !loading && <div className="alert alert-danger py-2">{error}</div>}

      {form && !isFormPublished(form) && (
        <div className="alert alert-warning py-2">
          Formulário com status <strong>{form.meta.status ?? 'draft'}</strong> — ainda não publicado.
        </div>
      )}

      {form && !loading && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid key={reloadKey} schema={form.schema} />
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
