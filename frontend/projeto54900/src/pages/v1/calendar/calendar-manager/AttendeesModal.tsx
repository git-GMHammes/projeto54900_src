import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { calendarEventAttendeesTable, calendarEventInvitesTable, formManagerView } from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import type { CalendarEventRow } from '@/services/calendarSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

import { ATTENDEE_FORM_SLUG } from './constants';
import { withDefaultValues } from './helpers';

/** Convidado de um evento (calendar_event_attendees), como vem da API própria da tabela. */
interface AttendeeRow {
  id: number;
  userManagerId: number | null;
  email: string;
  displayName: string;
  responseStatus: string;
  isOrganizer: boolean;
  isSelf: boolean;
  isResource: boolean;
  isOptional: boolean;
}

/** Checkboxes do convite exibidos como badge na lista — só os marcados aparecem (rótulos do form 'cadastro-convidado'). */
const ATTENDEE_FLAGS: { key: 'isOrganizer' | 'isSelf' | 'isResource' | 'isOptional'; label: string; icon: string }[] = [
  { key: 'isOrganizer', label: 'Organizador', icon: 'star' },
  { key: 'isSelf', label: 'Próprio usuário', icon: 'person' },
  { key: 'isResource', label: 'Recurso', icon: 'door-closed' },
  { key: 'isOptional', label: 'Opcional', icon: 'question-circle' },
];

/** Rótulo pt-BR do ENUM response_status (mesmos textos das opções do form 'cadastro-convidado'). */
const RESPONSE_STATUS_LABEL: Record<string, string> = {
  needsAction: 'Sem resposta',
  accepted: 'Aceitou',
  declined: 'Recusou',
  tentative: 'Talvez',
};

function toAttendee(r: Record<string, unknown>): AttendeeRow {
  const text = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
  const userId = Number(r.user_manager_id);
  return {
    id: Number(r.id),
    userManagerId: Number.isFinite(userId) && userId > 0 ? userId : null,
    email: text(r.email),
    displayName: text(r.display_name),
    responseStatus: text(r.response_status),
    isOrganizer: text(r.is_organizer) === '1',
    isSelf: text(r.is_self) === '1',
    isResource: text(r.is_resource) === '1',
    isOptional: text(r.is_optional) === '1',
  };
}

/**
 * Modal "Convidados" — lista via API calendar-event-attendees (find por
 * calendar_event_id) + form_manager 'cadastro-convidado' com
 * calendar_event_id pré-preenchido (campo oculto).
 */
export default function AttendeesModal({
  event,
  showBackButton,
  onClose,
}: {
  /** Evento cujos convidados estão sendo geridos; null = modal fechado. */
  event: CalendarEventRow | null;
  /** true quando veio do "Ver eventos" — muda o texto do botão de fechar. */
  showBackButton: boolean;
  onClose: () => void;
}) {
  const toast = useToast();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Troca a `key` do <FormGrid> após cada convite gravado — limpa o formulário para o próximo.
  const [formKey, setFormKey] = useState(0);

  // Convite por e-mail (calendar-event-invites/create) — cadastrado ou não.
  // Ação fixa, fora do form dinâmico 'cadastro-convidado' (que exige usuário
  // já existente); não vira attendee agora, só quando o convidado aceitar o
  // link recebido por e-mail.
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingByEmail, setInvitingByEmail] = useState(false);

  useEffect(() => {
    formManagerView
      .getGrouped({ fm_slug: [ATTENDEE_FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setForm(built);
        if (!built) setFormError(`Nenhum formulario publicado para a slug "${ATTENDEE_FORM_SLUG}".`);
      })
      .catch((err) => {
        setForm(null);
        setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      });
  }, []);

  const loadAttendees = useCallback(
    async (eventId: number) => {
      setLoading(true);
      try {
        const raw = await calendarEventAttendeesTable.find(
          { calendar_event_id: eventId },
          { sort: 'id', order: 'ASC', limit: 500 },
        );
        setAttendees(normalizeList<Record<string, unknown>>(raw).rows.map(toAttendee));
      } catch (err) {
        setAttendees([]);
        toast.error(err instanceof ApiError ? err.message : 'Falha ao carregar os convidados.', { title: 'Convidados' });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!event) return;
    setAttendees([]);
    setFormKey((k) => k + 1);
    void loadAttendees(event.id);
  }, [event, loadAttendees]);

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
        toast.success('Convidado adicionado.', { title: form.meta.title });
        setFormKey((k) => k + 1);
        void loadAttendees(event.id);
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
    [form, event, loadAttendees, toast],
  );

  /** Envia o convite por e-mail (calendar-event-invites/create) — cadastrado ou não. */
  const handleInviteByEmail = useCallback(
    async (submitEvent: FormEvent<HTMLFormElement>) => {
      submitEvent.preventDefault();
      if (!event) return;
      const email = inviteEmail.trim();
      if (!email) return;

      setInvitingByEmail(true);
      try {
        await calendarEventInvitesTable.create({ calendar_event_id: event.id, email });
        toast.success('Convite enviado por e-mail.', { title: 'Convidados' });
        setInviteEmail('');
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao convidar' });
        } else {
          toast.error('Falha inesperada ao enviar o convite.', { title: 'Erro ao convidar' });
        }
      } finally {
        setInvitingByEmail(false);
      }
    },
    [event, inviteEmail, toast],
  );

  /** Remove o convite (soft delete na API da própria tabela) e recarrega a lista. */
  const removeAttendee = useCallback(
    async (attendee: AttendeeRow) => {
      if (!event) return;
      const who = attendee.displayName || attendee.email;
      if (!window.confirm(`Remover ${who} dos convidados?`)) return;
      try {
        await calendarEventAttendeesTable.deleteSoft(attendee.id);
        toast.success('Convidado removido.', { title: 'Convidados' });
        void loadAttendees(event.id);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao remover o convidado.', { title: 'Convidados' });
      }
    },
    [event, loadAttendees, toast],
  );

  return (
    <Modal open={!!event} title={event ? `Convidados — ${event.summary}` : 'Convidados'} onClose={onClose} size="lg">
      {event && (
        <>
          {loading && <p className="text-body-secondary small mb-3">Carregando convidados...</p>}

          {!loading && attendees.length === 0 && (
            <EmptyState
              variant="warning"
              title="Nenhum convidado"
              description="Este evento ainda nao tem convidados. Use o formulario abaixo."
            />
          )}

          {!loading && attendees.length > 0 && (() => {
            // Badges dos checkboxes marcados + status — mesmas no desktop e no card mobile.
            const badgesFor = (a: AttendeeRow) => (
              <>
                {ATTENDEE_FLAGS.filter((f) => a[f.key]).map((f) => (
                  <span key={f.key} className="badge text-bg-light border">
                    <i className={`bi bi-${f.icon} me-1`} aria-hidden="true" />
                    {f.label}
                  </span>
                ))}
                <span className="badge text-bg-secondary">
                  {RESPONSE_STATUS_LABEL[a.responseStatus] ?? a.responseStatus}
                </span>
              </>
            );
            const removeButton = (a: AttendeeRow) => (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                aria-label={`Remover ${a.displayName || a.email}`}
                onClick={() => void removeAttendee(a)}
              >
                <i className="bi bi-trash" />
              </button>
            );

            return (
              <>
                {/* Desktop (md+): 1 linha por convidado. */}
                <ul className="list-group mb-3 d-none d-md-flex">
                  {attendees.map((a) => (
                    <li key={a.id} className="list-group-item d-flex align-items-center gap-2">
                      <i className="bi bi-person-check text-body-secondary" aria-hidden="true" />
                      <div className="flex-grow-1 text-truncate">
                        <div className="fw-semibold text-truncate">{a.displayName || a.email}</div>
                        {a.displayName && <div className="small text-body-secondary text-truncate">{a.email}</div>}
                      </div>
                      <div className="d-flex flex-wrap justify-content-end gap-1">{badgesFor(a)}</div>
                      {removeButton(a)}
                    </li>
                  ))}
                </ul>

                {/* Mobile (< md): 1 card por convidado — nome no título, e-mail inteiro, badges quebrando linha. */}
                <div className="d-md-none d-flex flex-column gap-2 mb-3">
                  {attendees.map((a) => (
                    <div className="card shadow-sm" key={a.id}>
                      <div className="card-body p-3">
                        <div className="fw-semibold">{a.displayName || a.email}</div>
                        {a.displayName && <div className="small text-body-secondary text-break mb-2">{a.email}</div>}
                        <div className="d-flex flex-wrap gap-1">{badgesFor(a)}</div>
                      </div>
                      <div className="card-footer bg-transparent d-flex justify-content-end py-2">{removeButton(a)}</div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </>
      )}

      {event && (
        <form onSubmit={(e) => void handleInviteByEmail(e)} noValidate className="border-top pt-3 mb-3">
          <label htmlFor="invite-by-email" className="form-label fw-semibold">
            Convidar por e-mail (com ou sem cadastro)
          </label>
          <div className="d-flex gap-2">
            <input
              id="invite-by-email"
              type="email"
              className="form-control"
              placeholder="usuario@dominio.com.br"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-outline-primary text-nowrap" disabled={invitingByEmail}>
              {invitingByEmail ? 'Enviando...' : 'Convidar por e-mail'}
            </button>
          </div>
          <div className="form-text">
            Envia um link de convite por e-mail. Se a pessoa ainda não tiver conta, uma conta é criada
            automaticamente quando ela aceitar o convite.
          </div>
        </form>
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
              {submitting ? 'Enviando...' : 'Convidar'}
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
