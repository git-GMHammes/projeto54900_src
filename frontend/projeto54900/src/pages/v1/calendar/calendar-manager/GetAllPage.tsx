// Pagina /v1/calendar-manager: lista calendarios com os eventos de cada um,
// a partir da view_calendar_manager (1 linha por evento, agrupada no cliente
// por calendario via services/calendarSchema.ts). Busca e paginacao sao
// CLIENTE (a view nao pagina por calendario, so por linha da view — mesmo
// debito ja aceito em FormConstructorPage.tsx, aqui resolvido com
// getNoPagination em vez de limit alto).
//
// Arquivo dividido por responsabilidade (2026-09-25, arquivo original tinha
// 2040 linhas): esta página só orquestra — lista principal, paginação,
// ações da linha do calendário, respostas de convite (myResponses/isAdmin)
// e qual modal está aberto. Cada modal e o bloco de agenda (seletor +
// calendário mês/ano + cards) viram componente próprio na mesma pasta:
//   constants.ts            slugs, PAGE_SIZE, upload module/accept, selects
//   helpers.ts              funções puras (formatação, filtro, agrupamento)
//   RowActionButton.tsx     botão de ação de list_actions (linha)
//   AgendaViewer.tsx        seletor de agenda + collapse mês/ano + cards
//   CreateCalendarModal.tsx modal "Novo Calendário"
//   EditCalendarModal.tsx   modal "Editar"
//   CreateEventModal.tsx    modal "Criar evento"
//   ViewEventsModal.tsx     modal "Ver eventos"
//   AttendeesModal.tsx      modal "Convidados"
//   RemindersModal.tsx      modal "Lembretes"
//   AttachmentsModal.tsx    modal "Anexos"

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/http';
import {
  calendarManagerView,
  calendarEventAttendeesTable,
  respondToEvent,
  listManagerTable,
  listActionsTable,
  listColumnsTable,
} from '@/services/v1';
import { groupCalendarView } from '@/services/calendarSchema';
import type { CalendarEventRow, CalendarGroup } from '@/services/calendarSchema';
import { normalizeList } from '@/utils/apiResult';
import { errorDetail } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { toManager, toAction, toColumn } from '@/utils/listConstructor';
import type { ListActionRow, ListColumnRow } from '@/utils/listConstructor';

import {
  EDIT_FORM_SLUG,
  EVENT_FORM_SLUG,
  ATTENDEE_FORM_SLUG,
  REMINDER_FORM_SLUG,
  ATTACHMENT_FORM_SLUG,
  ACTIONS_LIST_SLUG,
  EVENTS_LIST_SLUG,
  PAGE_SIZE,
} from './constants';
import { matchesSearch } from './helpers';
import RowActionButton from './RowActionButton';
import AgendaViewer from './AgendaViewer';
// Ordem dos modais = ordem em que aparecem no JSX abaixo (calendário -> ver eventos -> criar evento -> sub-recursos do evento).
import CreateCalendarModal from './CreateCalendarModal';
import EditCalendarModal from './EditCalendarModal';
import ViewEventsModal from './ViewEventsModal';
import CreateEventModal from './CreateEventModal';
import AttendeesModal from './AttendeesModal';
import RemindersModal from './RemindersModal';
import AttachmentsModal from './AttachmentsModal';

export default function CalendarManagerGetAllPage() {
  const toast = useToast();
  const { user } = useAuth();

  // response_status do PRÓPRIO usuário logado, por calendar_event_id — decide se o card/linha
  // do evento mostra Aceitar/Recusar (ainda não aceitou) ou as ações tradicionais (já aceitou).
  const [myResponses, setMyResponses] = useState<Record<number, string>>({});

  // Listagem (view_calendar_manager, agrupada por calendario).
  const [groups, setGroups] = useState<CalendarGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca e paginacao — 100% no cliente (ver header do arquivo).
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal "Novo Calendário".
  const [showFormModal, setShowFormModal] = useState(false);

  // Acoes por linha (list_manager/list_actions, slug 'calendar-manager') — coluna de acoes so-icone.
  const [actions, setActions] = useState<ListActionRow[]>([]);

  // Colunas do modal "Ver eventos" (list_manager/list_columns, slug 'calendar-events-view').
  const [eventColumns, setEventColumns] = useState<ListColumnRow[]>([]);
  // Ações por evento (list_actions do mesmo list_manager 'calendar-events-view'), ex.: Excluir evento.
  const [eventActions, setEventActions] = useState<ListActionRow[]>([]);
  const [viewingGroup, setViewingGroup] = useState<CalendarGroup | null>(null);

  // Grupo em edição/criação de evento — modais autocontidos (Edit/CreateEvent).
  const [editingGroup, setEditingGroup] = useState<CalendarGroup | null>(null);
  const [creatingEventFor, setCreatingEventFor] = useState<CalendarGroup | null>(null);

  // Convidados/Lembretes/Anexos de um evento — cada modal é autocontido (form, lista, CRUD);
  // aqui só guardamos o evento + o calendário de origem (o "Ver eventos" que fechou ao abrir,
  // e para onde volta ao fechar).
  const [attendeesFor, setAttendeesFor] = useState<{ event: CalendarEventRow; group: CalendarGroup | null } | null>(null);
  const [remindersFor, setRemindersFor] = useState<{ event: CalendarEventRow; group: CalendarGroup | null } | null>(null);
  const [attachmentsFor, setAttachmentsFor] = useState<{ event: CalendarEventRow; group: CalendarGroup | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await calendarManagerView.getNoPagination({ sort: 'cm_id', order: 'ASC' });
      const { rows } = normalizeList(raw);
      setGroups(groupCalendarView(rows));
    } catch (err) {
      setGroups(null);
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar os calendarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Acha um list_manager pela slug (getNoPagination + filtro local — mesmo padrao de FormConstructorListPage.tsx). */
  const findListManager = useCallback(async (slug: string) => {
    const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
    const { rows } = normalizeList<Record<string, unknown>>(raw);
    return rows.map(toManager).find((m) => m.slug === slug) ?? null;
  }, []);

  const loadActions = useCallback(async () => {
    try {
      const manager = await findListManager(ACTIONS_LIST_SLUG);
      if (!manager) {
        setActions([]);
        return;
      }
      const raw = await listActionsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 50 });
      setActions(normalizeList<Record<string, unknown>>(raw).rows.map(toAction));
    } catch {
      setActions([]);
    }
  }, [findListManager]);

  const loadEventColumns = useCallback(async () => {
    try {
      const manager = await findListManager(EVENTS_LIST_SLUG);
      if (!manager) {
        setEventColumns([]);
        setEventActions([]);
        return;
      }
      const [rawColumns, rawActions] = await Promise.all([
        listColumnsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 50 }),
        listActionsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 50 }),
      ]);
      setEventColumns(normalizeList<Record<string, unknown>>(rawColumns).rows.map(toColumn));
      setEventActions(normalizeList<Record<string, unknown>>(rawActions).rows.map(toAction));
    } catch {
      setEventColumns([]);
      setEventActions([]);
    }
  }, [findListManager]);

  /**
   * response_status do próprio usuário em TODOS os eventos em que foi convidado — 1 chamada
   * (find por user_manager_id), não 1 por evento. Alimenta myResponses (calendar_event_id ->
   * response_status) usado para decidir Aceitar/Recusar vs. ações tradicionais.
   */
  const loadMyResponses = useCallback(async () => {
    if (!user) {
      setMyResponses({});
      return;
    }
    try {
      const raw = await calendarEventAttendeesTable.find(
        { user_manager_id: user.id },
        { sort: 'id', order: 'ASC', limit: 1000 },
      );
      const map: Record<number, string> = {};
      for (const r of normalizeList<Record<string, unknown>>(raw).rows) {
        const eventId = Number(r.calendar_event_id);
        if (Number.isFinite(eventId)) map[eventId] = typeof r.response_status === 'string' ? r.response_status : '';
      }
      setMyResponses(map);
    } catch {
      setMyResponses({});
    }
  }, [user]);

  useEffect(() => {
    void load();
    void loadActions();
    void loadEventColumns();
    void loadMyResponses();
  }, [load, loadActions, loadEventColumns, loadMyResponses]);

  // O modal "Ver eventos" guarda uma cópia do grupo: ao recarregar a listagem
  // (ex.: após excluir um evento) troca pela versão nova do mesmo calendário.
  useEffect(() => {
    setViewingGroup((prev) =>
      prev ? (groups ?? []).find((g) => g.calendar.id === prev.calendar.id) ?? null : null,
    );
  }, [groups]);

  // Busca nova sempre volta pra pagina 1 (senao a pagina atual pode nao existir mais).
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredGroups = useMemo(
    () => (groups ?? []).filter((g) => matchesSearch(g, search)),
    [groups, search],
  );
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const pageGroups = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /** Pós-ação de um evento (ex.: Excluir evento): avisa e recarrega — o modal aberto se atualiza pelo efeito em `groups`. */
  const handleEventActionExecuted = useCallback(
    (action: ListActionRow) => {
      toast.success('Ação concluída.', { title: action.label });
      void load();
    },
    [toast, load],
  );

  /**
   * Aceitar/Recusar convite do próprio usuário logado (cards de "Próximos
   * eventos") — PUT respond/{calendar_event_id}, resolvido pelo back-end via
   * CurrentUser::id() (nunca manda id de attendee). Recusar só muda
   * response_status: o evento continua aparecendo para o convidado até o
   * dono removê-lo do convite.
   */
  const handleRespondToEvent = useCallback(
    async (ev: CalendarEventRow, status: 'accepted' | 'declined') => {
      try {
        await respondToEvent(ev.id, status);
        toast.success(status === 'accepted' ? 'Convite aceito.' : 'Convite recusado.', { title: ev.summary });
        void load();
        void loadMyResponses();
        // Recusar fecha o "Ver eventos" (se estiver aberto) — o convidado não vai
        // querer continuar olhando a tabela de um evento que acabou de recusar.
        if (status === 'declined') setViewingGroup(null);
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao responder' });
        } else {
          toast.error('Falha inesperada ao responder.', { title: 'Erro ao responder' });
        }
      }
    },
    [toast, load, loadMyResponses],
  );

  // Admin não é convidado de nada (idsForCurrentUser() sem restrição no back-end) — nunca
  // mostra Aceitar/Recusar, só as ações tradicionais.
  const isAdmin = user?.role?.slug === 'admin';

  /**
   * Ações de UM evento: enquanto o próprio usuário não aceitou o convite
   * (myResponses[ev.id] !== 'accepted'), mostra só Aceitar/Recusar; depois de
   * aceitar, mostra as ações tradicionais (Convidados/Lembretes/Anexos/Excluir
   * evento — `eventActions`, list_actions de 'calendar-events-view'). Usado
   * nos cards de "Próximos eventos" (AgendaViewer) e na tabela/cards do "Ver eventos".
   */
  const eventActionsOrRespond = useCallback(
    (ev: CalendarEventRow, onOpenModal: (slug: string) => void): ReactNode => {
      if (!isAdmin && myResponses[ev.id] !== 'accepted') {
        return (
          <>
            <span className="icon-action-tooltip">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                aria-label="Aceitar convite"
                onClick={() => void handleRespondToEvent(ev, 'accepted')}
              >
                <i className="bi bi-check-lg" />
              </button>
              <span className="icon-action-tooltip-bubble" role="tooltip">
                Aceitar
              </span>
            </span>
            <span className="icon-action-tooltip">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                aria-label="Recusar convite"
                onClick={() => void handleRespondToEvent(ev, 'declined')}
              >
                <i className="bi bi-x-lg" />
              </button>
              <span className="icon-action-tooltip-bubble" role="tooltip">
                Recusar
              </span>
            </span>
          </>
        );
      }

      return (
        <>
          {eventActions.map((a) => (
            <RowActionButton
              key={a.id}
              action={a}
              row={ev as unknown as Record<string, unknown>}
              onOpenModal={onOpenModal}
              onExecuted={handleEventActionExecuted}
            />
          ))}
        </>
      );
    },
    [isAdmin, myResponses, eventActions, handleRespondToEvent, handleEventActionExecuted],
  );

  /** Ramo 'modal' de list_actions da linha do calendário: decide qual modal abrir pelo slug em href_template. */
  const handleOpenModal = useCallback((targetSlug: string, group: CalendarGroup) => {
    if (targetSlug === EDIT_FORM_SLUG) {
      setEditingGroup(group);
      return;
    }
    if (targetSlug === EVENTS_LIST_SLUG) {
      setViewingGroup(group);
      return;
    }
    if (targetSlug === EVENT_FORM_SLUG) {
      setCreatingEventFor(group);
    }
  }, []);

  /**
   * Ramo 'modal' das ações de um evento (list_actions de 'calendar-events-view').
   * `group` = calendário do "Ver eventos" de origem (fechar volta a ele); `null` = aberto
   * pelos cards da agenda (fechar só fecha).
   */
  const handleOpenEventModal = useCallback(
    (targetSlug: string, event: CalendarEventRow, group: CalendarGroup | null) => {
      setViewingGroup(null);
      if (targetSlug === ATTENDEE_FORM_SLUG) {
        setAttendeesFor({ event, group });
        return;
      }
      if (targetSlug === REMINDER_FORM_SLUG) {
        setRemindersFor({ event, group });
        return;
      }
      if (targetSlug === ATTACHMENT_FORM_SLUG) {
        setAttachmentsFor({ event, group });
      }
    },
    [],
  );

  /** Fecha "Convidados" e, se veio do "Ver eventos", reabre o do calendário de origem. */
  const closeAttendees = useCallback(() => {
    const origin = attendeesFor?.group ?? null;
    setAttendeesFor(null);
    setViewingGroup(origin);
  }, [attendeesFor]);

  /** Fecha "Lembretes" e, se veio do "Ver eventos", reabre o do calendário de origem. */
  const closeReminders = useCallback(() => {
    const origin = remindersFor?.group ?? null;
    setRemindersFor(null);
    setViewingGroup(origin);
  }, [remindersFor]);

  /** Fecha "Anexos" e, se veio do "Ver eventos", reabre o do calendário de origem. */
  const closeAttachments = useCallback(() => {
    const origin = attachmentsFor?.group ?? null;
    setAttachmentsFor(null);
    setViewingGroup(origin);
  }, [attachmentsFor]);

  return (
    <>
      <PageHeader title="Calendários" subtitle="view_calendar_manager (calendar_manager → calendar_events)">
        <button className="btn btn-outline-secondary me-2" onClick={() => void load()} disabled={loading}>
          Recarregar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setShowFormModal(true)}>
          Novo Calendário
        </button>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {error && !loading && <EmptyState title="Listagem indisponivel" description={error} variant="danger" />}

      {!loading && !error && (
        <>
          <div className="mb-3">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nome ou local do calendário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredGroups.length === 0 && (
            <EmptyState
              variant="warning"
              eyebrow={groups && groups.length > 0 ? 'Nenhum resultado' : 'Lista vazia'}
              title="Nenhum calendario encontrado"
              description={
                groups && groups.length > 0
                  ? 'Nenhum calendario bate com a busca atual.'
                  : "Crie o primeiro em 'Novo Calendário'."
              }
            />
          )}

          {pageGroups.map((group) => (
            <div className="card border-0 shadow-sm mb-3" key={group.calendar.id}>
              <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <strong>{group.calendar.summary}</strong>{' '}
                  {group.calendar.status && (
                    <span
                      className={`badge ${group.calendar.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'} ms-1`}
                    >
                      {group.calendar.status}
                    </span>
                  )}
                  {group.calendar.location && (
                    <div className="small text-body-secondary">{group.calendar.location}</div>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-body-secondary">
                    {group.events.length} evento(s) · {group.calendar.timeZone ?? 'sem fuso'}
                  </span>
                  {actions.length > 0 && (
                    <div className="d-flex gap-1" role="group" aria-label="Ações do calendário">
                      {actions.map((a) => (
                        <RowActionButton
                          key={a.id}
                          action={a}
                          row={group.calendar as unknown as Record<string, unknown>}
                          onOpenModal={(slug) => handleOpenModal(slug, group)}
                          onExecuted={() => void load()}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredGroups.length > 0 && (
            <nav aria-label="Paginação" className="d-flex justify-content-end">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
                  <button type="button" className="page-link" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Anterior
                  </button>
                </li>
                {paginationWindow(page, totalPages).map((tok, i) =>
                  tok === '...' ? (
                    <li key={`ellipsis-${i}`} className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  ) : (
                    <li key={tok} className={`page-item${tok === page ? ' active' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        aria-current={tok === page ? 'page' : undefined}
                        onClick={() => setPage(tok)}
                      >
                        {tok}
                      </button>
                    </li>
                  ),
                )}
                <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <AgendaViewer
            groups={groups}
            renderEventActions={eventActionsOrRespond}
            onOpenEventModal={(slug, ev) => handleOpenEventModal(slug, ev, null)}
          />
        </>
      )}

      <CreateCalendarModal open={showFormModal} onClose={() => setShowFormModal(false)} onCreated={() => void load()} />

      <EditCalendarModal group={editingGroup} onClose={() => setEditingGroup(null)} onSaved={() => void load()} />

      <ViewEventsModal
        group={viewingGroup}
        eventColumns={eventColumns}
        renderEventActions={eventActionsOrRespond}
        onOpenEventModal={handleOpenEventModal}
        onClose={() => setViewingGroup(null)}
      />

      <CreateEventModal group={creatingEventFor} onClose={() => setCreatingEventFor(null)} onCreated={() => void load()} />

      <AttendeesModal
        event={attendeesFor?.event ?? null}
        showBackButton={!!attendeesFor?.group}
        onClose={closeAttendees}
      />

      <RemindersModal
        event={remindersFor?.event ?? null}
        showBackButton={!!remindersFor?.group}
        onClose={closeReminders}
      />

      <AttachmentsModal
        event={attachmentsFor?.event ?? null}
        showBackButton={!!attachmentsFor?.group}
        onClose={closeAttachments}
      />
    </>
  );
}
