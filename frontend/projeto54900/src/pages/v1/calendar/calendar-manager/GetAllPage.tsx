// Pagina /v1/calendar-manager: lista calendarios com os eventos de cada um,
// a partir da view_calendar_manager (1 linha por evento, agrupada no cliente
// por calendario via services/calendarSchema.ts). Busca e paginacao sao
// CLIENTE (a view nao pagina por calendario, so por linha da view — mesmo
// debito ja aceito em FormConstructorPage.tsx, aqui resolvido com
// getNoPagination em vez de limit alto). "Novo Calendario" reaproveita o
// form_manager de slug 'calendario' ja publicado (mesmo <FormGrid> usado em
// pages/v1/form/FormRendererPage.tsx).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import FakeFillButton from '@/components/global/FakeFillButton';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { http, ApiError, hasAccessToken } from '@/services/http';
import { calendarManagerView, formManagerView, listManagerTable, listActionsTable, listColumnsTable, userManagerTable } from '@/services/v1';
import { groupCalendarView } from '@/services/calendarSchema';
import type { CalendarGroup, CalendarManagerRow } from '@/services/calendarSchema';
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
 * Botão só-ícone de uma ação de `list_actions` (calendar-manager). 'modal'
 * avisa a página (que decide qual modal abrir, pelo slug em hrefTemplate);
 * 'api_call' executa de verdade (mesmo padrão do FormConstructorListPage.tsx).
 */
function CalendarActionButton({
  action,
  group,
  onOpenModal,
  onExecuted,
}: {
  action: ListActionRow;
  group: CalendarGroup;
  onOpenModal: (targetSlug: string, group: CalendarGroup) => void;
  onExecuted: () => void;
}) {
  const toast = useToast();
  const row = group.calendar as unknown as Record<string, unknown>;

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
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        aria-label={action.label}
        onClick={() => onOpenModal(action.hrefTemplate, group)}
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
      onExecuted();
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

/** true quando o termo de busca aparece no calendario ou em algum dos seus eventos. */
function matchesSearch(group: CalendarGroup, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystacks = [
    group.calendar.summary,
    group.calendar.description,
    group.calendar.location,
    ...group.events.flatMap((e) => [e.summary, e.description, e.location]),
  ];
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
        return;
      }
      const raw = await listColumnsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 50 });
      setEventColumns(normalizeList<Record<string, unknown>>(raw).rows.map(toColumn));
    } catch {
      setEventColumns([]);
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
              placeholder="Buscar por calendario ou evento..."
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
                        <CalendarActionButton
                          key={a.id}
                          action={a}
                          group={group}
                          onOpenModal={handleOpenModal}
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

        {viewingGroup && viewingGroup.events.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead>
                <tr>
                  {eventColumns.map((c) => (
                    <th key={c.id}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewingGroup.events.map((ev) => {
                  const row: Record<string, unknown> = {
                    ...ev,
                    displayStart: ev.startDatetime ?? ev.startDate ?? '',
                    displayEnd: ev.endDatetime ?? ev.endDate ?? '',
                  };
                  return (
                    <tr key={ev.id}>
                      {eventColumns.map((c) => (
                        <td key={c.id}>{renderCell(c, row)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
