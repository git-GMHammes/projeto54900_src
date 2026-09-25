import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import type { CalendarGroup } from '@/services/calendarSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { resolveHrefTemplate } from '@/utils/listConstructor';

import { EDIT_FORM_SLUG } from './constants';
import { calendarToFieldValues, withDefaultValues } from './helpers';

/** Modal "Editar" — form_manager slug 'editar-calendario', pre-preenchido com a linha clicada, grava via PUT. */
export default function EditCalendarModal({
  group,
  onClose,
  onSaved,
}: {
  group: CalendarGroup | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    formManagerView
      .getGrouped({ fm_slug: [EDIT_FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setForm(built);
        if (!built) setFormError(`Nenhum formulario publicado para a slug "${EDIT_FORM_SLUG}".`);
      })
      .catch((err) => {
        setForm(null);
        setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>, currentGroup: CalendarGroup) => {
      event.preventDefault();
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(resolveHrefTemplate(form.meta.submitEndpoint, { id: currentGroup.calendar.id }));

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Calendário atualizado.', { title: form.meta.title });
        onClose();
        onSaved();
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
    [form, onClose, onSaved, toast],
  );

  return (
    <Modal open={!!group} title={form?.meta.title ?? 'Editar Calendário'} onClose={onClose} size="lg">
      {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}

      {form && !isFormPublished(form) && (
        <EmptyState
          title="Formulario indisponivel"
          description={`Status "${form.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
        />
      )}

      {form && isFormPublished(form) && group && (
        <form onSubmit={(e) => void handleSubmit(e, group)} noValidate>
          <FormGrid
            key={group.calendar.id}
            schema={withDefaultValues(form.schema, calendarToFieldValues(group.calendar))}
          />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
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
