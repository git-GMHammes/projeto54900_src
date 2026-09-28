/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/EditPostModal.tsx
 * =========================================================================
 *
 * O QUE FAZ: modal de EDIÇÃO de uma publicação, aberto pelo ícone de lápis
 * ao lado da data no `PostCard` (2026-09-28). Mesmo padrão do
 * `NewPostModal.tsx`/`NewReportModal.tsx`: schema do `form_manager` slug
 * `timeline-post` (lido de `view_form_manager`) montado com `FormGrid` —
 * nada de `<textarea>` escrito à mão.
 *
 * CAMPOS: só "Publicação" (`content`), preenchido com o texto atual via
 * `defaultValue`. O campo "Anexo" (`file`) é REMOVIDO do schema
 * (`forEdit`) — pedido do usuário: "UPLOAD não edita". O anexo existente
 * continua exibido no card, sem troca nem remoção por aqui.
 *
 * ENVIO: `PUT /api/v1/timeline-posts/update/{id}` (`timelinePostsTable.update`)
 * só com `content`. O backend (`Processor::update` -> `assertOwner`) devolve
 * 404 para post de outro usuário — o card nem mostra o lápis nesse caso, mas
 * a regra de dono vale no servidor. `edited_at` é carimbado pelo Processor.
 * Sucesso -> `onUpdated(content)` (a página troca o texto do card) e fecha.
 *
 * DEPENDÊNCIAS: `@/components/ui/FormGrid/Input`, `@/components/global/Modal`,
 * `@/services/formSchema`, `@/services/v1` (`formManagerView`,
 * `timelinePostsTable`), `@/utils/{apiResult,formSubmit}`.
 * CONSUMIDORES: `pages/v1/timeline/home-feed/PostCard.tsx`.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView, timelinePostsTable } from '@/services/v1';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail } from '@/utils/formSubmit';

const FORM_SLUG = 'timeline-post';
/** `field_name` do texto da publicação no form `timeline-post`. */
const CONTENT_FIELD = 'content';
/** Campos que NÃO entram na edição (upload não edita). */
const EXCLUDED_FIELDS = new Set(['file']);

/** Tira o anexo do schema e preenche o texto atual; linha que ficar vazia some junto. */
function forEdit(schema: RenderForm['schema'], content: string): RenderForm['schema'] {
  return {
    rows: schema.rows
      .map((row) => ({
        ...row,
        fields: row.fields
          .filter((field) => !EXCLUDED_FIELDS.has((field as { name?: string }).name ?? ''))
          // `content` e campo de texto (textarea/text): defaultValue string. O cast so existe porque a
          // union AnyFieldSchema inclui checkbox (defaultValue string[]), que nunca e o campo content.
          .map((field) =>
            (field as { name?: string }).name === CONTENT_FIELD
              ? ({ ...field, defaultValue: content } as typeof field)
              : field,
          ),
      }))
      .filter((row) => row.fields.length > 0),
  };
}

export default function EditPostModal({
  open,
  postId,
  content,
  onClose,
  onUpdated,
}: {
  open: boolean;
  postId: number;
  /** Texto atual da publicação — vira o `defaultValue` do campo. */
  content: string;
  onClose: () => void;
  /** Edição salva — recebe o texto novo para a página atualizar o card. */
  onUpdated: (content: string) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        setForm({ ...built, schema: forEdit(built.schema, content) });
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
  }, [open, content]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = formDataToPayload(event.currentTarget)[CONTENT_FIELD];
      const next = typeof value === 'string' ? value.trim() : '';
      if (next === '') {
        toast.error('Informe o texto da publicação.', { title: 'Editar publicação' });
        return;
      }

      setSubmitting(true);
      try {
        await timelinePostsTable.update(postId, { [CONTENT_FIELD]: next });
        toast.success('Publicação atualizada.', { title: 'Editar publicação' });
        onUpdated(next);
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao editar' });
        } else {
          toast.error('Falha inesperada ao editar.', { title: 'Erro ao editar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [postId, toast, onUpdated, onClose],
  );

  return (
    <Modal open={open} title="Editar publicação" onClose={onClose} size="lg">
      {loading && <div className="text-body-secondary">Carregando formulário…</div>}

      {error && !loading && <div className="alert alert-danger py-2">{error}</div>}

      {form && !loading && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
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
