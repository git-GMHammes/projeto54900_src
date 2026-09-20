// Pagina /v1/calendar-manager: lista calendarios com os eventos de cada um,
// a partir da view_calendar_manager (1 linha por evento, agrupada no cliente
// por calendario via services/calendarSchema.ts). Busca e paginacao sao
// CLIENTE (a view nao pagina por calendario, so por linha da view — mesmo
// debito ja aceito em FormConstructorPage.tsx, aqui resolvido com
// getNoPagination em vez de limit alto). "Novo Calendario" reaproveita o
// form_manager de slug 'calendario' ja publicado (mesmo <FormGrid> usado em
// pages/v1/form/FormRendererPage.tsx).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { calendarManagerView, formManagerView } from '@/services/v1';
import { groupCalendarView } from '@/services/calendarSchema';
import type { CalendarGroup } from '@/services/calendarSchema';
import { buildRenderSchema } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';

const CALENDAR_FORM_SLUG = 'calendario';
const PAGE_SIZE = 10;

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

  const loadForm = useCallback(async () => {
    try {
      const raw = await formManagerView.getGrouped(
        { fm_slug: [CALENDAR_FORM_SLUG] },
        { limit: 1000, sort: 'fc_sort_order', order: 'ASC' },
      );
      const { rows } = normalizeList(raw);
      const built = buildRenderSchema(rows);
      setForm(built);
      if (!built) setFormError(`Nenhum formulario publicado para a slug "${CALENDAR_FORM_SLUG}".`);
    } catch (err) {
      setForm(null);
      setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario de criacao.');
    }
  }, []);

  useEffect(() => {
    void load();
    void loadForm();
  }, [load, loadForm]);

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
                <span className="small text-body-secondary">
                  {group.events.length} evento(s) · {group.calendar.timeZone ?? 'sem fuso'}
                </span>
              </div>

              {group.events.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Status</th>
                        <th>Inicio</th>
                        <th>Fim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.events.map((ev) => (
                        <tr key={ev.id}>
                          <td>{ev.summary}</td>
                          <td>{ev.status}</td>
                          <td>{ev.startDatetime ?? ev.startDate ?? '—'}</td>
                          <td>{ev.endDatetime ?? ev.endDate ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      <Modal open={showFormModal} title={form?.meta.title ?? 'Novo Calendário'} onClose={() => setShowFormModal(false)} size="lg">
        {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}
        {form && (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <FormGrid schema={form.schema} />
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
    </>
  );
}
