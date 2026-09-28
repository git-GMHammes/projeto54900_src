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
 * página (`onCreated(postId)`) — desde 2026-09-28 com o id do post criado,
 * que a página fixa no topo até o F5.
 *
 * CAMPOS (form enxuto, 2026-09-28 — "como em qualquer rede social"): só
 * "Publicação*" (`content`) e "Anexo" (`file`). Timeline, Republicar de,
 * Título e Status saíram do form (soft delete em `form_fields`); o backend
 * resolve a timeline do usuário e grava `status = 'published'` sozinho.
 *
 * ANEXO (1 por publicação): o form `timeline-post` tem um campo
 * `field_type = 'arquivo'` com `field_name = 'file'` (FormGrid
 * `components/ui/FormGrid/arquivo`). O `File` NÃO vai no JSON do post
 * (`formDataToPayload` ignora não-string) — o envio é em 2 ETAPAS:
 *   1. cria o post (JSON, `submit_endpoint` do form, como sempre);
 *   2. se houver arquivo, envia em multipart para o backend EXCLUSIVO da
 *      Timeline (`timelinePostAttachmentsUpload.upload`, tabela
 *      `timeline_post_attachments`) com o id do post recém-criado.
 *   Se a etapa 2 falhar, o post continua publicado SEM anexo e o usuário vê
 *   um aviso (não há rollback do post — decisão registrada no plano P1).
 *
 * FAKE FILL (dev-only): com o form carregado, monta `<FakeFillButton
 * slug="timeline-post">` — texto médio + imagem aleatória de
 * doc/clipart_teste (script `dev/fakeFill/timelinePost.ts`), mesmo padrão do
 * `CreateEventModal` do Calendar.
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input`, `@/components/global/Modal`,
 * `@/components/global/FakeFillButton`,
 * `@/services/formSchema` (`buildRenderSchema`, `isFormPublished`),
 * `@/services/v1` (`formManagerView`, `timelinePostAttachmentsUpload`),
 * `@/utils/{apiResult,formSubmit}`.
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx` (botão
 * flutuante).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, timelinePostAttachmentsUpload } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

const FORM_SLUG = 'timeline-post';
/** `field_name` do campo 'arquivo' no form `timeline-post` (form_fields). */
const FILE_FIELD = 'file';

/** O arquivo escolhido no campo de anexo, ou null (input vazio vem como File de tamanho 0). */
function pickFile(el: HTMLFormElement): File | null {
  const value = new FormData(el).get(FILE_FIELD);
  return value instanceof File && value.size > 0 ? value : null;
}

export default function NewPostModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** `postId` = id do post recém-criado (null se o backend não devolveu) — a página o fixa no topo. */
  onCreated: (postId: number | null) => void;
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
      const file = pickFile(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        // Etapa 1 — o post (JSON).
        const created = normalizeItem<Record<string, unknown>>(await send(path, payload));
        const postId = created?.id;

        // Etapa 2 — o anexo (multipart), só se houver arquivo. Falha aqui não desfaz o post.
        if (file && (typeof postId === 'number' || typeof postId === 'string')) {
          try {
            await timelinePostAttachmentsUpload.upload({ file, timelinePostId: postId });
          } catch (err) {
            const motivo = err instanceof ApiError ? `${err.message}${errorDetail(err)}` : 'falha inesperada';
            toast.error(`A publicação foi criada, mas o anexo não foi enviado: ${motivo}`, { title: 'Anexo' });
          }
        }

        toast.success('Publicação criada.', { title: 'Novo post' });
        el.reset();
        setReloadKey((k) => k + 1);
        const createdId = Number(postId);
        onCreated(Number.isFinite(createdId) && createdId > 0 ? createdId : null);
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

      {open && form && !loading && isFormPublished(form) && <FakeFillButton slug={FORM_SLUG} />}
    </Modal>
  );
}
