import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { calendarEventRemindersTable, formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import type { CalendarEventRow } from '@/services/calendarSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

import { REMINDER_FORM_SLUG } from './constants';
import { withDefaultValues } from './helpers';

/** Lembrete de um evento (calendar_event_reminders), como vem da API própria da tabela. */
interface ReminderRow {
  id: number;
  method: string;
  minutes: number;
}

/** Rótulos pt-BR do ENUM method (mesmos textos das opções do form 'cadastro-lembrete'). */
const REMINDER_METHOD: Record<string, { label: string; icon: string }> = {
  popup: { label: 'Notificação', icon: 'bell' },
  email: { label: 'E-mail', icon: 'envelope' },
};

/** Antecedência em texto — espelho da lista fixa do form (5/10/30 min, 1 h, 1 dia, 1 semana); fora dela, em minutos. */
function reminderMinutesLabel(minutes: number): string {
  if (minutes === 10080) return '1 semana antes';
  if (minutes === 1440) return '1 dia antes';
  if (minutes === 60) return '1 hora antes';
  return `${minutes} minutos antes`;
}

function toReminder(r: Record<string, unknown>): ReminderRow {
  return {
    id: Number(r.id),
    method: typeof r.method === 'string' ? r.method : '',
    minutes: Number(r.minutes) || 0,
  };
}

/**
 * Modal "Lembretes" — lista via API calendar-event-reminders (find por
 * calendar_event_id) + form_manager 'cadastro-lembrete' com
 * calendar_event_id pré-preenchido (campo oculto). Só grava a configuração:
 * ainda não há agendador que dispare o aviso.
 */
export default function RemindersModal({
  event,
  showBackButton,
  onClose,
}: {
  event: CalendarEventRow | null;
  showBackButton: boolean;
  onClose: () => void;
}) {
  const toast = useToast();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    formManagerView
      .getGrouped({ fm_slug: [REMINDER_FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setForm(built);
        if (!built) setFormError(`Nenhum formulario publicado para a slug "${REMINDER_FORM_SLUG}".`);
      })
      .catch((err) => {
        setForm(null);
        setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      });
  }, []);

  /** Lembretes ativos de um evento — POST find por calendar_event_id, do mais próximo do início ao mais distante. */
  const loadReminders = useCallback(
    async (eventId: number) => {
      setLoading(true);
      try {
        const raw = await calendarEventRemindersTable.find(
          { calendar_event_id: eventId },
          { sort: 'minutes', order: 'ASC', limit: 500 },
        );
        setReminders(normalizeList<Record<string, unknown>>(raw).rows.map(toReminder));
      } catch (err) {
        setReminders([]);
        toast.error(err instanceof ApiError ? err.message : 'Falha ao carregar os lembretes.', { title: 'Lembretes' });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!event) return;
    setReminders([]);
    setFormKey((k) => k + 1);
    void loadReminders(event.id);
  }, [event, loadReminders]);

  const handleSubmit = useCallback(
    async (submitEvent: FormEvent<HTMLFormElement>) => {
      submitEvent.preventDefault();
      if (!event) return;
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const payload = formDataToPayload(submitEvent.currentTarget);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Lembrete adicionado.', { title: form.meta.title });
        setFormKey((k) => k + 1);
        void loadReminders(event.id);
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
    [form, event, loadReminders, toast],
  );

  /** Remove o lembrete (soft delete na API da própria tabela) e recarrega a lista. */
  const removeReminder = useCallback(
    async (reminder: ReminderRow) => {
      if (!event) return;
      const what = `${REMINDER_METHOD[reminder.method]?.label ?? reminder.method} ${reminderMinutesLabel(reminder.minutes)}`;
      if (!window.confirm(`Remover o lembrete "${what}"?`)) return;
      try {
        await calendarEventRemindersTable.deleteSoft(reminder.id);
        toast.success('Lembrete removido.', { title: 'Lembretes' });
        void loadReminders(event.id);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao remover o lembrete.', { title: 'Lembretes' });
      }
    },
    [event, loadReminders, toast],
  );

  return (
    <Modal open={!!event} title={event ? `Lembretes — ${event.summary}` : 'Lembretes'} onClose={onClose} size="lg">
      {event && (
        <>
          {loading && <p className="text-body-secondary small mb-3">Carregando lembretes...</p>}

          {!loading && reminders.length === 0 && (
            <EmptyState
              variant="warning"
              title="Nenhum lembrete"
              description="Este evento ainda nao tem lembretes. Use o formulario abaixo."
            />
          )}

          {!loading && reminders.length > 0 && (
            <div className="d-flex flex-column gap-2 mb-3">
              {reminders.map((r) => {
                const method = REMINDER_METHOD[r.method];
                return (
                  <div key={r.id} className="card shadow-sm">
                    <div className="card-body p-2 ps-3 d-flex align-items-center gap-2">
                      <i className={`bi bi-${method?.icon ?? 'bell'} text-body-secondary`} aria-hidden="true" />
                      <div className="flex-grow-1">
                        <span className="fw-semibold">{method?.label ?? r.method}</span>
                        <span className="text-body-secondary"> · {reminderMinutesLabel(r.minutes)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        aria-label={`Remover lembrete ${method?.label ?? r.method} ${reminderMinutesLabel(r.minutes)}`}
                        onClick={() => void removeReminder(r)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}

      {form && !isFormPublished(form) && (
        <EmptyState
          title="Formulario indisponivel"
          description={`Status "${form.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
        />
      )}

      {form && isFormPublished(form) && event && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="border-top pt-3">
          <FormGrid
            key={`${event.id}-${formKey}`}
            schema={withDefaultValues(form.schema, { calendar_event_id: String(event.id) })}
          />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Adicionar lembrete'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              {showBackButton ? 'Voltar aos eventos' : 'Fechar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
