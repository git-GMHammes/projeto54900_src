// Pagina /v1/calendar-manager: lista calendarios com os eventos de cada um,
// a partir da view_calendar_manager (1 linha por evento, agrupada no cliente
// por calendario via services/calendarSchema.ts). Busca e paginacao sao
// CLIENTE (a view nao pagina por calendario, so por linha da view — mesmo
// debito ja aceito em FormConstructorPage.tsx, aqui resolvido com
// getNoPagination em vez de limit alto). "Novo Calendario" reaproveita o
// form_manager de slug 'calendario' ja publicado (mesmo <FormGrid> usado em
// pages/v1/form/FormRendererPage.tsx).

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import MonthCalendar from '@/components/ui/MonthCalendar';
import type { MonthCalendarEvent } from '@/components/ui/MonthCalendar';
import YearCalendar from '@/components/ui/YearCalendar';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { env } from '@/config/env';
import { http, ApiError, hasAccessToken } from '@/services/http';
import { calendarManagerView, formManagerView, listManagerTable, listActionsTable, listColumnsTable, userManagerTable } from '@/services/v1';
import { groupCalendarView } from '@/services/calendarSchema';
import type { CalendarEventRow, CalendarGroup, CalendarManagerRow } from '@/services/calendarSchema';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { toManager, toAction, toColumn, renderCell, resolveHrefTemplate } from '@/utils/listConstructor';
import type { ListActionRow, ListColumnRow } from '@/utils/listConstructor';

// Slugs dos registros persistidos que dirigem esta tela — nada de coluna/ação
// fixa no código (ver README_list_constructor.md e calendar_manager_editar.md).
const CALENDAR_FORM_SLUG = 'calendario'; // form_manager: criar calendário (POST)
const EDIT_FORM_SLUG = 'editar-calendario'; // form_manager: editar calendário (PUT)
const EVENT_FORM_SLUG = 'cadastro-evento'; // form_manager: criar evento (POST)
const ACTIONS_LIST_SLUG = 'calendar-manager'; // list_manager: ações da linha (list_actions)
const EVENTS_LIST_SLUG = 'calendar-events-view'; // list_manager: colunas do modal "Ver eventos"
const PAGE_SIZE = 10;
// Usuários de sistema (user_manager, status 'blocked' — não logam) usados como
// dono padrão do calendário quando a sessão JWT não identifica o usuário:
// sem token -> 'guest'; com token mas sem usuário resolvido -> 'unknown'.
const GUEST_USERNAME = 'guest';
const UNKNOWN_USERNAME = 'unknown';
// Select de agenda abaixo da lista: carga inicial paginada (limit 1000) e, ao
// digitar, POST find por summary (LIKE no backend) — alcança agendas fora das 1000.
const CALENDAR_SELECT_SRC = `${env.apiBaseUrl}/v1/calendar-manager/get-all?page=1&limit=1000&sort=summary&order=ASC`;
const CALENDAR_FIND_SRC = `${env.apiBaseUrl}/v1/calendar-manager/find?limit=50`;

/** Valores atuais do calendário, por field_name do form_manager — usado para pré-preencher o modal "Editar". */
function calendarToFieldValues(c: CalendarManagerRow): Record<string, string> {
  return {
    summary: c.summary,
    location: c.location ?? '',
    description: c.description ?? '',
    user_manager_id: c.userManagerId !== undefined ? String(c.userManagerId) : '',
    google_calendar_id: c.googleCalendarId ?? '',
    is_primary: c.isPrimary ? '1' : '',
    access_role: c.accessRole ?? '',
    background_color: c.backgroundColor ?? '',
    foreground_color: c.foregroundColor ?? '',
    time_zone: c.timeZone ?? '',
    status: c.status ?? '',
  };
}

/** Injeta defaultValue por field_name num FormGridSchema já montado — dado que a página já tem em tela, sem nova chamada de API. */
function withDefaultValues(schema: RenderForm['schema'], values: Record<string, string>): RenderForm['schema'] {
  return {
    rows: schema.rows.map((row) => ({
      ...row,
      fields: row.fields.map((field) => {
        const f = field as unknown as { name?: string; type?: string };
        if (!f.name || !(f.name in values)) return field;
        const raw = values[f.name] ?? '';
        if (f.type === 'checkbox') {
          return { ...field, defaultValue: raw ? [raw] : [] } as unknown as typeof field;
        }
        return { ...field, defaultValue: raw } as unknown as typeof field;
      }),
    })),
  };
}

/**
 * Botão só-ícone de uma ação de `list_actions` para uma linha (calendário ou
 * evento). 'modal' avisa a página (que decide qual modal abrir, pelo slug em
 * hrefTemplate); 'api_call' executa de verdade (mesmo padrão do
 * FormConstructorListPage.tsx) — `{campo}` do endpoint/mensagem sai de `row`.
 */
function RowActionButton({
  action,
  row,
  onOpenModal,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  onOpenModal?: (targetSlug: string) => void;
  onExecuted: (action: ListActionRow) => void;
}) {
  const toast = useToast();

  if (action.actionType === 'link') return null;

  // Tooltip custom (bolha CSS, styles/_custom.scss) em vez do `title` nativo
  // do navegador — este ultimo tem fonte fixa do SO e brigaria visualmente
  // com a bolha se os dois aparecessem juntos no hover.
  const withTooltip = (button: ReactNode) => (
    <span className="icon-action-tooltip">
      {button}
      <span className="icon-action-tooltip-bubble" role="tooltip">
        {action.label}
      </span>
    </span>
  );

  if (action.actionType === 'modal') {
    if (!onOpenModal) return null;
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        aria-label={action.label}
        onClick={() => onOpenModal(action.hrefTemplate)}
      >
        <i className={`bi bi-${action.icon}`} />
      </button>,
    );
  }

  const execute = async () => {
    const message = resolveHrefTemplate(action.confirmMessage, row) || `Confirma ${action.label}?`;
    if (action.confirm && !window.confirm(message)) return;
    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
      onExecuted(action);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: action.label });
    }
  };

  return withTooltip(
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      aria-label={action.label}
      onClick={() => void execute()}
    >
      <i className={`bi bi-${action.icon}`} />
    </button>,
  );
}

/** Início/fim do evento como texto ISO — data pura (evento de dia inteiro) ou data+hora. */
function eventStart(ev: CalendarEventRow): string {
  return ev.startDate ?? ev.startDatetime ?? '';
}
function eventEnd(ev: CalendarEventRow): string {
  return ev.endDate ?? ev.endDatetime ?? '';
}

/**
 * Eventos com alguma parte dentro de [from, to] (datas ISO 'YYYY-MM-DD'; '' = lado aberto),
 * comparando só a data de início..fim de cada evento; ordenados pela hora de início.
 */
function eventsInRange(events: CalendarEventRow[], from: string, to: string): CalendarEventRow[] {
  return events
    .filter((ev) => {
      const start = eventStart(ev).slice(0, 10);
      const end = (eventEnd(ev) || start).slice(0, 10);
      return start !== '' && (!to || start <= to) && (!from || end >= from);
    })
    .sort((a, b) => eventStart(a).localeCompare(eventStart(b)));
}

/** "fevereiro de 2028" — nome do mês (0-11) + ano, em pt-BR. */
function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

/** 'YYYY-MM-DD[ HH:MM:SS]' -> 'DD/MM/AAAA[ HH:MM]' (sem Date, evita deslocamento de fuso). */
function formatIsoBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m;
  return `${d}/${mo}/${y}${h !== undefined && mi !== undefined ? ` ${h}:${mi}` : ''}`;
}

/** true quando o termo de busca aparece no nome ou no local do calendario (descricao e eventos ficam de fora). */
function matchesSearch(group: CalendarGroup, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystacks = [group.calendar.summary, group.calendar.location];
  return haystacks.some((v) => v?.toLowerCase().includes(needle));
}

export default function CalendarManagerGetAllPage() {
  const toast = useToast();
  const { user, bootstrapping } = useAuth();

  // ids de 'guest'/'unknown' em user_manager, buscados por username (nunca fixos no código).
  const [fallbackOwners, setFallbackOwners] = useState<{ guest: string; unknown: string }>({ guest: '', unknown: '' });

  // Listagem (view_calendar_manager, agrupada por calendario).
  const [groups, setGroups] = useState<CalendarGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca e paginacao — 100% no cliente (ver header do arquivo).
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Formulario de criacao (form_manager slug 'calendario'), aberto no modal.
  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Acoes por linha (list_manager/list_actions, slug 'calendar-manager') — coluna de acoes so-icone.
  const [actions, setActions] = useState<ListActionRow[]>([]);

  // Colunas do modal "Ver eventos" (list_manager/list_columns, slug 'calendar-events-view').
  const [eventColumns, setEventColumns] = useState<ListColumnRow[]>([]);
  // Ações por evento (list_actions do mesmo list_manager 'calendar-events-view'), ex.: Excluir evento.
  const [eventActions, setEventActions] = useState<ListActionRow[]>([]);
  const [viewingGroup, setViewingGroup] = useState<CalendarGroup | null>(null);

  // Formulario de edicao (form_manager slug 'editar-calendario'), pre-preenchido com a linha clicada.
  const [editForm, setEditForm] = useState<RenderForm | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<CalendarGroup | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Formulario de criacao de evento (form_manager slug 'cadastro-evento'), calendar_id pre-selecionado.
  const [eventForm, setEventForm] = useState<RenderForm | null>(null);
  const [eventFormError, setEventFormError] = useState<string | null>(null);
  const [creatingEventFor, setCreatingEventFor] = useState<CalendarGroup | null>(null);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Agenda escolhida no select abaixo da lista + collapses "Mês atual" / "Ano".
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [showMonth, setShowMonth] = useState(false);
  const [showYear, setShowYear] = useState(false);
  // Dia clicado no calendário (ISO 'YYYY-MM-DD') — lista os eventos dele em cards.
  const [selectedDay, setSelectedDay] = useState('');
  // Período dos campos Início/Fim (ISO 'YYYY-MM-DD'; '' = aberto/incompleto) — lista os eventos em cards.
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  // Âncora do bloco de cards: o clique num dia rola a página até ele.
  const cardsRef = useRef<HTMLDivElement>(null);

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

  /** Busca um form_manager pela slug (getGrouped + buildRenderSchema) — mesmo pipeline em 3 pontos (criar/editar/criar evento), só muda a slug e o setState. */
  const fetchForm = useCallback(
    async (slug: string, setFn: (f: RenderForm | null) => void, setErr: (e: string | null) => void) => {
      try {
        const raw = await formManagerView.getGrouped(
          { fm_slug: [slug] },
          { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
        );
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setFn(built);
        if (!built) setErr(`Nenhum formulario publicado para a slug "${slug}".`);
      } catch (err) {
        setFn(null);
        setErr(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      }
    },
    [],
  );

  const loadForm = useCallback(() => fetchForm(CALENDAR_FORM_SLUG, setForm, setFormError), [fetchForm]);

  /** Carrega os ids de 'guest'/'unknown' (dono padrão quando a sessão não identifica o usuário). */
  const loadFallbackOwners = useCallback(async () => {
    try {
      const { rows } = normalizeList<Record<string, unknown>>(
        await userManagerTable.getNoPagination({ sort: 'id', order: 'ASC' }),
      );
      const idOf = (username: string) => {
        const id = rows.find((r) => r.username === username)?.id;
        return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
      };
      setFallbackOwners({ guest: idOf(GUEST_USERNAME), unknown: idOf(UNKNOWN_USERNAME) });
    } catch {
      setFallbackOwners({ guest: '', unknown: '' });
    }
  }, []);

  // Dono padrão do "Novo Calendário": usuário da sessão JWT; sem ele, 'unknown'
  // (há token, mas o usuário não foi resolvido) ou 'guest' (sem sessão).
  const defaultOwnerId = bootstrapping
    ? ''
    : user
      ? String(user.id)
      : hasAccessToken()
        ? fallbackOwners.unknown
        : fallbackOwners.guest;
  const loadEditForm = useCallback(() => fetchForm(EDIT_FORM_SLUG, setEditForm, setEditFormError), [fetchForm]);
  const loadEventForm = useCallback(() => fetchForm(EVENT_FORM_SLUG, setEventForm, setEventFormError), [fetchForm]);

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

  useEffect(() => {
    void load();
    void loadForm();
    void loadEditForm();
    void loadEventForm();
    void loadActions();
    void loadEventColumns();
    void loadFallbackOwners();
  }, [load, loadForm, loadEditForm, loadEventForm, loadActions, loadEventColumns, loadFallbackOwners]);

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

  // Eventos da agenda escolhida — saem de `groups` (view inteira, sem paginação), sem nova chamada.
  const selectedGroupEvents = useMemo(
    () => groups?.find((g) => String(g.calendar.id) === selectedCalendarId)?.events ?? [],
    [groups, selectedCalendarId],
  );
  const selectedEvents = useMemo<MonthCalendarEvent[]>(
    () =>
      selectedGroupEvents.map((ev) => {
        const start = eventStart(ev);
        return { start, end: eventEnd(ev) || start, summary: ev.summary };
      }),
    [selectedGroupEvents],
  );
  // Cards — a agenda é a busca; datas e dia só restringem (ambos opcionais):
  //   1) agenda escolhida -> todos os eventos dela (qualquer ano);
  //   2) + Início/Fim     -> só os do período;
  //   3) + dia clicado    -> só os do dia (prioridade; o X volta ao nível 2/1).
  const dayMode = !!selectedDay && (showMonth || showYear);
  const rangeMode = !dayMode && !!(rangeStart || rangeEnd);
  const cardEvents = useMemo(() => {
    if (dayMode) return eventsInRange(selectedGroupEvents, selectedDay, selectedDay);
    if (rangeMode) return eventsInRange(selectedGroupEvents, rangeStart, rangeEnd);
    return eventsInRange(selectedGroupEvents, '', '');
  }, [dayMode, rangeMode, selectedGroupEvents, selectedDay, rangeStart, rangeEnd]);
  const cardsTitle = dayMode
    ? `Eventos de ${formatIsoBr(selectedDay)}`
    : !rangeMode
      ? 'Eventos da agenda'
      : rangeStart && rangeEnd
        ? `Eventos de ${formatIsoBr(rangeStart)} a ${formatIsoBr(rangeEnd)}`
        : rangeStart
          ? `Eventos a partir de ${formatIsoBr(rangeStart)}`
          : `Eventos até ${formatIsoBr(rangeEnd)}`;
  const cardsEmptyText = rangeMode ? 'Nenhum compromisso no período.' : 'Esta agenda não tem eventos.';

  // Âncora: clique num dia leva o navegador até o início dos cards.
  useEffect(() => {
    if (selectedDay) cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedDay]);

  /** onChange dos campos de data: só guarda a data completa (ISO); digitando, fica '' (período aberto). */
  const onRangeChange = (setFn: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFn(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
    setSelectedDay('');
  };
  const now = new Date();
  // Mês/ano de referência dos calendários: o do Início quando preenchido (lido do texto ISO, sem
  // Date, evita fuso); senão, hoje. Apagar o Início volta ao mês/ano atuais.
  const refYear = rangeStart ? Number(rangeStart.slice(0, 4)) : now.getFullYear();
  const refMonth = rangeStart ? Number(rangeStart.slice(5, 7)) - 1 : now.getMonth();

  // Mês exibido sem eventos da agenda: aviso + atalho para o próximo evento (ou o anterior,
  // se não houver próximo) — evita confundir evento de outro ano com o mês exibido.
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const monthFirst = `${refYear}-${pad2(refMonth + 1)}-01`;
  const monthLast = `${refYear}-${pad2(refMonth + 1)}-${pad2(new Date(refYear, refMonth + 1, 0).getDate())}`;
  const monthHasEvents = eventsInRange(selectedGroupEvents, monthFirst, monthLast).length > 0;
  const allSorted = eventsInRange(selectedGroupEvents, '', '');
  // Último evento que termina antes do mês e primeiro que começa depois — datas de início (ISO).
  const prevEvent = [...allSorted].reverse().find((ev) => (eventEnd(ev) || eventStart(ev)).slice(0, 10) < monthFirst);
  const nextEvent = allSorted.find((ev) => eventStart(ev).slice(0, 10) > monthLast);
  const prevDate = !monthHasEvents && prevEvent ? eventStart(prevEvent).slice(0, 10) : '';
  const nextDate = !monthHasEvents && nextEvent ? eventStart(nextEvent).slice(0, 10) : '';
  /** Atalho do aviso: leva o Início (e, com ele, Mês/Ano/cards) até a data do evento. */
  const jumpTo = (iso: string) => {
    setRangeStart(iso);
    setSelectedDay('');
  };
  const isoMonthLabel = (iso: string) => monthLabel(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);

      setSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Calendario criado.', { title: form.meta.title });
        el.reset();
        setShowFormModal(false);
        void load();
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
    [form, load, toast],
  );

  /** Ramo 'modal' de list_actions: decide qual modal abrir pelo slug gravado em href_template. */
  /** Pós-ação de um evento (ex.: Excluir evento): avisa e recarrega — o modal aberto se atualiza pelo efeito em `groups`. */
  const handleEventActionExecuted = useCallback(
    (action: ListActionRow) => {
      toast.success('Ação concluída.', { title: action.label });
      void load();
    },
    [toast, load],
  );

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

  const handleEditSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>, group: CalendarGroup) => {
      event.preventDefault();
      if (!editForm?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(editForm.meta.httpMethod);
      const path = resolveEndpoint(resolveHrefTemplate(editForm.meta.submitEndpoint, { id: group.calendar.id }));

      setEditSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Calendário atualizado.', { title: editForm.meta.title });
        setEditingGroup(null);
        void load();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setEditSubmitting(false);
      }
    },
    [editForm, load, toast],
  );

  const handleEventSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!eventForm?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }

      const el = event.currentTarget;
      const payload = formDataToPayload(el);
      const send = senderFor(eventForm.meta.httpMethod);
      const path = resolveEndpoint(eventForm.meta.submitEndpoint);

      setEventSubmitting(true);
      try {
        await send(path, payload);
        toast.success('Evento criado.', { title: eventForm.meta.title });
        setCreatingEventFor(null);
        void load();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar.', { title: 'Erro ao enviar' });
        }
      } finally {
        setEventSubmitting(false);
      }
    },
    [eventForm, load, toast],
  );

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

          {/* Row de layout 6|6; os campos seguem via <FormGrid>. Na esquerda o select
              divide o espaço com os 2 botões; na direita as datas em col 6 (= 3/12 cada). */}
          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <div className="d-flex align-items-start gap-2">
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <FormGrid
                    schema={{
                      rows: [
                        {
                          fields: [
                            {
                              type: 'select',
                              col: 12,
                              label: 'Agenda',
                              name: 'calendar_id',
                              src: CALENDAR_SELECT_SRC,
                              findSrc: CALENDAR_FIND_SRC,
                              findColumn: 'summary',
                              valueKey: 'id',
                              labelKey: 'summary',
                              value: selectedCalendarId,
                              onChange: (value) => {
                                setSelectedCalendarId(value);
                                setSelectedDay('');
                              },
                            },
                          ],
                        },
                      ],
                    }}
                  />
                </div>
                {/* mt-4 pt-2 (2rem) = altura do label do campo, alinha os botões com o input. */}
                <span className="icon-action-tooltip mt-4 pt-2">
                  <button
                    type="button"
                    className={`btn ${showMonth ? 'btn-primary' : 'btn-outline-primary'}`}
                    aria-label="Mês atual"
                    aria-expanded={showMonth}
                    aria-controls="calendar-month-collapse"
                    onClick={() => setShowMonth((v) => !v)}
                  >
                    <i className="bi bi-calendar3" />
                  </button>
                  <span className="icon-action-tooltip-bubble" role="tooltip">
                    Mês atual
                  </span>
                </span>
                <span className="icon-action-tooltip mt-4 pt-2">
                  <button
                    type="button"
                    className={`btn ${showYear ? 'btn-primary' : 'btn-outline-primary'}`}
                    aria-label="Ano"
                    aria-expanded={showYear}
                    aria-controls="calendar-year-collapse"
                    onClick={() => setShowYear((v) => !v)}
                  >
                    <i className="bi bi-calendar-range" />
                  </button>
                  <span className="icon-action-tooltip-bubble" role="tooltip">
                    Ano
                  </span>
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <FormGrid
                schema={{
                  rows: [
                    {
                      fields: [
                        {
                          type: 'data',
                          col: 6,
                          label: 'Início',
                          name: 'start_date',
                          // Controlado: o atalho "Ir para o próximo evento" ajusta o Início.
                          value: rangeStart,
                          onChange: onRangeChange(setRangeStart),
                        },
                        { type: 'data', col: 6, label: 'Fim', name: 'end_date', onChange: onRangeChange(setRangeEnd) },
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>

          {/* Botões/datas sem agenda escolhida: aviso em vez de clique/digitação muda. */}
          {(showMonth || showYear || rangeStart || rangeEnd) && !selectedCalendarId && (
            <div className="alert alert-warning py-2 mt-3" role="alert">
              Selecione uma agenda para ver os eventos.
            </div>
          )}

          {/* Cards da agenda escolhida (filtro opcional por período/dia) — acima dos calendários; âncora do clique no dia. */}
          {selectedCalendarId && (
            <div ref={cardsRef} className="mt-3 mb-4" style={{ scrollMarginTop: '1rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h6 mb-0">
                  {cardsTitle}{' '}
                  <span className="text-body-secondary fw-normal">({cardEvents.length})</span>
                </h2>
                {dayMode && (
                  <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setSelectedDay('')} />
                )}
              </div>
              {cardEvents.length === 0 && (
                <div className="text-body-secondary small">{cardsEmptyText}</div>
              )}
              <div className="row g-3">
                {cardEvents.map((ev) => (
                  <div className="col-md-6 col-lg-4" key={ev.id}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <h3 className="h6 card-title mb-0">{ev.summary}</h3>
                          {ev.status && (
                            <span
                              className={`badge ${
                                ev.status === 'confirmed'
                                  ? 'text-bg-success'
                                  : ev.status === 'tentative'
                                    ? 'text-bg-warning'
                                    : 'text-bg-secondary'
                              }`}
                            >
                              {ev.status}
                            </span>
                          )}
                        </div>
                        <div className="small text-body-secondary mb-2">
                          <i className="bi bi-clock me-1" />
                          {formatIsoBr(eventStart(ev))}
                          {eventEnd(ev) && ` → ${formatIsoBr(eventEnd(ev))}`}
                          {ev.location && (
                            <>
                              <br />
                              <i className="bi bi-geo-alt me-1" />
                              {ev.location}
                            </>
                          )}
                        </div>
                        {ev.description && <p className="card-text small mb-0">{ev.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="calendar-month-collapse" className={`collapse${showMonth ? ' show' : ''}`}>
            <MonthCalendar
              year={refYear}
              month={refMonth}
              size="lg"
              className="mb-4"
              events={selectedEvents}
              onDayClick={setSelectedDay}
              selectedDate={selectedDay}
              markedDate={rangeStart}
            />
            {selectedCalendarId && !monthHasEvents && (
              <div className="alert alert-light border d-flex flex-wrap align-items-center gap-2 mb-4 py-2">
                <span>
                  Nenhum evento em <span className="text-capitalize">{monthLabel(refYear, refMonth)}</span>.
                </span>
                {prevDate && (
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={() => jumpTo(prevDate)}>
                    <i className="bi bi-chevron-left" /> Evento anterior ({isoMonthLabel(prevDate)})
                  </button>
                )}
                {nextDate && (
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={() => jumpTo(nextDate)}>
                    Próximo evento ({isoMonthLabel(nextDate)}) <i className="bi bi-chevron-right" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div id="calendar-year-collapse" className={`collapse${showYear ? ' show' : ''}`}>
            <h2 className="h5 mb-3">Ano {refYear} — janeiro a dezembro</h2>
            <YearCalendar
              year={refYear}
              className="mb-4"
              events={selectedEvents}
              onDayClick={setSelectedDay}
              selectedDate={selectedDay}
              markedDate={rangeStart}
            />
          </div>
        </>
      )}

      {showFormModal && form && isFormPublished(form) && <FakeFillButton slug={CALENDAR_FORM_SLUG} />}

      <Modal open={showFormModal} title={form?.meta.title ?? 'Novo Calendário'} onClose={() => setShowFormModal(false)} size="lg">
        {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}

        {form && !isFormPublished(form) && (
          <EmptyState
            title="Formulario indisponivel"
            description={`Status "${form.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
          />
        )}

        {form && isFormPublished(form) && (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <FormGrid
              key={defaultOwnerId}
              schema={withDefaultValues(form.schema, { user_manager_id: defaultOwnerId })}
            />
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Criar'}
              </button>
              <button type="reset" className="btn btn-outline-secondary">
                Limpar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal "Editar" — form_manager 'editar-calendario', pre-preenchido com a linha clicada, grava via PUT. */}
      <Modal
        open={!!editingGroup}
        title={editForm?.meta.title ?? 'Editar Calendário'}
        onClose={() => setEditingGroup(null)}
        size="lg"
      >
        {editFormError && !editForm && <EmptyState title="Formulario indisponivel" description={editFormError} />}

        {editForm && !isFormPublished(editForm) && (
          <EmptyState
            title="Formulario indisponivel"
            description={`Status "${editForm.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
          />
        )}

        {editForm && isFormPublished(editForm) && editingGroup && (
          <form onSubmit={(e) => void handleEditSubmit(e, editingGroup)} noValidate>
            <FormGrid
              key={editingGroup.calendar.id}
              schema={withDefaultValues(editForm.schema, calendarToFieldValues(editingGroup.calendar))}
            />
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                {editSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingGroup(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal "Ver eventos" — tabela dirigida por list_columns (slug 'calendar-events-view'), dado ja carregado (sem nova chamada). */}
      <Modal
        open={!!viewingGroup}
        title={viewingGroup ? `Eventos — ${viewingGroup.calendar.summary}` : 'Eventos'}
        onClose={() => setViewingGroup(null)}
        size="lg"
      >
        {viewingGroup?.events.length === 0 && (
          <EmptyState
            variant="warning"
            title="Nenhum evento"
            description="Este calendario ainda nao tem eventos. Use 'Criar evento'."
          />
        )}

        {viewingGroup && viewingGroup.events.length > 0 && (() => {
          const rows = viewingGroup.events.map((ev) => ({
            id: ev.id,
            row: {
              ...ev,
              displayStart: ev.startDatetime ?? ev.startDate ?? '',
              displayEnd: ev.endDatetime ?? ev.endDate ?? '',
            },
          }));
          const actionsFor = (row: Record<string, unknown>) =>
            eventActions.map((a) => (
              <RowActionButton key={a.id} action={a} row={row} onExecuted={handleEventActionExecuted} />
            ));
          const [titleColumn, ...detailColumns] = eventColumns;

          return (
            <>
              {/* Desktop (md+): tabela. */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      {eventColumns.map((c) => (
                        <th key={c.id}>{c.label}</th>
                      ))}
                      {eventActions.length > 0 && <th className="text-end">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ id, row }) => (
                      <tr key={id}>
                        {eventColumns.map((c) => (
                          <td key={c.id}>{renderCell(c, row)}</td>
                        ))}
                        {eventActions.length > 0 && (
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">{actionsFor(row)}</div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile (< md): 1 card por evento — 1a coluna vira título, demais viram rótulo/valor. */}
              <div className="d-md-none d-flex flex-column gap-2">
                {rows.map(({ id, row }) => (
                  <div className="card shadow-sm" key={id}>
                    <div className="card-body p-3">
                      {titleColumn && <div className="fw-semibold mb-2">{renderCell(titleColumn, row)}</div>}
                      <dl className="row small mb-0">
                        {detailColumns.map((c) => (
                          <Fragment key={c.id}>
                            <dt className="col-4 fw-normal text-body-secondary">{c.label}</dt>
                            <dd className="col-8 mb-1">{renderCell(c, row)}</dd>
                          </Fragment>
                        ))}
                      </dl>
                    </div>
                    {eventActions.length > 0 && (
                      <div className="card-footer bg-transparent d-flex justify-content-end gap-1 py-2">
                        {actionsFor(row)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </Modal>

      {/* Modal "Criar evento" — form_manager 'cadastro-evento', calendar_id pre-selecionado com a linha clicada. */}
      {creatingEventFor && eventForm && isFormPublished(eventForm) && <FakeFillButton slug={EVENT_FORM_SLUG} />}

      <Modal
        open={!!creatingEventFor}
        title={eventForm?.meta.title ?? 'Novo Evento'}
        onClose={() => setCreatingEventFor(null)}
        size="lg"
      >
        {eventFormError && !eventForm && <EmptyState title="Formulario indisponivel" description={eventFormError} />}

        {eventForm && !isFormPublished(eventForm) && (
          <EmptyState
            title="Formulario indisponivel"
            description={`Status "${eventForm.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
          />
        )}

        {eventForm && isFormPublished(eventForm) && creatingEventFor && (
          <form onSubmit={(e) => void handleEventSubmit(e)} noValidate>
            <FormGrid
              key={creatingEventFor.calendar.id}
              schema={withDefaultValues(eventForm.schema, { calendar_id: String(creatingEventFor.calendar.id) })}
            />
            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button type="submit" className="btn btn-primary" disabled={eventSubmitting}>
                {eventSubmitting ? 'Enviando...' : 'Criar'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setCreatingEventFor(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
