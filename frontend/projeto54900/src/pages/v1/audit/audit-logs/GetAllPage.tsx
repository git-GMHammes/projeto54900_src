/**
 * =========================================================================
 * FILE HEADER — pages/v1/audit/audit-logs/GetAllPage.tsx
 * =========================================================================
 *
 * O QUE FAZ: rota `/v1/audit-logs` — consulta do log de auditoria e acesso
 * (`audit_logs`): quem fez o que, quando, de onde (IP), com o RAW enviado.
 * Filtros no topo, tabela paginada e modal de detalhe com todos os campos
 * (payload bruto, querystring, user agent, IP de destino, ID criado, sessao).
 *
 * SOMENTE LEITURA e SOMENTE ADMIN: a rota fica sob <RequireRole role="admin"/>
 * (routes/v1/audit.routes.tsx) e o backend tambem recusa nao admin (403).
 *
 * DEPENDENCIAS: services/v1/auditLogs (POST api/v1/audit-logs/find),
 * utils/apiResult (normalizeList), utils/pagination (paginationWindow).
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { ApiError } from '@/services/http';
import { auditLogsView } from '@/services/v1/auditLogs';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { paginationWindow } from '@/utils/pagination';
import type { ApiRow } from '@/types/api';

const PAGE_LIMIT = 20;

const EVENT_TYPES: readonly { value: string; label: string; badge: string }[] = [
  { value: 'request', label: 'Requisição', badge: 'text-bg-secondary' },
  { value: 'login_ok', label: 'Login', badge: 'text-bg-success' },
  { value: 'login_fail', label: 'Login falho', badge: 'text-bg-danger' },
  { value: 'token_refresh', label: 'Renovação de token', badge: 'text-bg-info' },
  { value: 'logout', label: 'Logoff', badge: 'text-bg-secondary' },
  { value: 'session_expired', label: 'Sessão expirada', badge: 'text-bg-warning' },
  { value: 'access_denied', label: 'Acesso negado', badge: 'text-bg-danger' },
  { value: 'block', label: 'Bloqueio', badge: 'text-bg-dark' },
];

const ACTIONS: readonly { value: string; label: string }[] = [
  { value: 'search', label: 'Busca' },
  { value: 'read', label: 'Leitura' },
  { value: 'create', label: 'Inclusão' },
  { value: 'update', label: 'Alteração' },
  { value: 'delete', label: 'Exclusão' },
  { value: 'restore', label: 'Restauração' },
  { value: 'auth', label: 'Autenticação' },
];

interface Filters {
  login: string;
  event_type: string;
  action: string;
  resource: string;
  ip_origin: string;
  date_from: string;
  date_to: string;
  q: string;
}

const EMPTY_FILTERS: Filters = {
  login: '',
  event_type: '',
  action: '',
  resource: '',
  ip_origin: '',
  date_from: '',
  date_to: '',
  q: '',
};

/** Monta o body do find: so campos preenchidos; datas viram o inicio e o fim do dia. */
function buildBody(f: Filters): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of Object.keys(f) as (keyof Filters)[]) {
    const v = f[key].trim();
    if (v === '') continue;
    if (key === 'date_from') body[key] = `${v} 00:00:00`;
    else if (key === 'date_to') body[key] = `${v} 23:59:59`;
    else body[key] = v;
  }
  return body;
}

function formatMoment(value: unknown): string {
  if (typeof value !== 'string' || value === '') return '-';
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('pt-BR');
}

/** Corpo bruto legivel: JSON valido vira identado; qualquer outro texto fica como veio. */
function prettyPayload(raw: unknown): string {
  if (typeof raw !== 'string' || raw === '') return '-';
  try {
    return JSON.stringify(JSON.parse(raw) as unknown, null, 2);
  } catch {
    return raw;
  }
}

function eventMeta(value: unknown): { label: string; badge: string } {
  const found = EVENT_TYPES.find((e) => e.value === value);
  return found ?? { label: toText(value), badge: 'text-bg-light' };
}

function actionLabel(value: unknown): string {
  return ACTIONS.find((a) => a.value === value)?.label ?? toText(value);
}

export default function AuditLogsGetAllPage() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiRow | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    auditLogsView
      .find(buildBody(applied), { page, limit: PAGE_LIMIT, sort: 'id', order: 'DESC' }, { signal: controller.signal })
      .then((raw) => {
        const list = normalizeList(raw);
        setRows(list.rows);
        setTotal(list.total);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar o log de auditoria.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [applied, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function setField(key: keyof Filters, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setApplied(draft);
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    setPage(1);
    setApplied(EMPTY_FILTERS);
  }

  return (
    <>
      <PageHeader
        title="Log de auditoria"
        subtitle="Ações dos usuários na API e eventos de sessão (login, logoff, expiração, acesso negado)."
      />

      <form className="card card-body mb-3" onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-login">Login</label>
            <input id="audit-login" className="form-control form-control-sm" value={draft.login} onChange={(e) => setField('login', e.target.value)} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-event">Evento</label>
            <select id="audit-event" className="form-select form-select-sm" value={draft.event_type} onChange={(e) => setField('event_type', e.target.value)}>
              <option value="">Todos</option>
              {EVENT_TYPES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-action">Ação</label>
            <select id="audit-action" className="form-select form-select-sm" value={draft.action} onChange={(e) => setField('action', e.target.value)}>
              <option value="">Todas</option>
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-resource">Recurso</label>
            <input id="audit-resource" className="form-control form-control-sm" placeholder="ex.: timeline-posts" value={draft.resource} onChange={(e) => setField('resource', e.target.value)} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-ip">IP de origem</label>
            <input id="audit-ip" className="form-control form-control-sm" value={draft.ip_origin} onChange={(e) => setField('ip_origin', e.target.value)} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-from">De</label>
            <input id="audit-from" type="date" className="form-control form-control-sm" value={draft.date_from} onChange={(e) => setField('date_from', e.target.value)} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-to">Até</label>
            <input id="audit-to" type="date" className="form-control form-control-sm" value={draft.date_to} onChange={(e) => setField('date_to', e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1" htmlFor="audit-q">Busca livre</label>
            <input id="audit-q" className="form-control form-control-sm" placeholder="rota, login, nome ou motivo" value={draft.q} onChange={(e) => setField('q', e.target.value)} />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary btn-sm">Filtrar</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClear}>Limpar</button>
        </div>
      </form>

      {loading && <LoadingOverlay />}

      {error ? (
        <EmptyState variant="danger" title="Não foi possível carregar o log" description={error} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState title="Nenhum registro encontrado" description="Ajuste os filtros ou aguarde novas ações dos usuários." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr>
                  <th>Data/hora</th>
                  <th>Evento</th>
                  <th>Usuário</th>
                  <th>Perfil / Empresa</th>
                  <th>Método</th>
                  <th>Rota</th>
                  <th>Ação</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>IP origem</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const meta = eventMeta(row.event_type);
                  return (
                    <tr key={toText(row.id, String(i))}>
                      <td className="text-nowrap">{formatMoment(row.created_at)}</td>
                      <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                      <td>
                        <div>{toText(row.login)}</div>
                        <div className="small text-body-secondary">{toText(row.full_name, '')}</div>
                      </td>
                      <td>
                        <div>{toText(row.profile)}</div>
                        <div className="small text-body-secondary">{toText(row.company_name, '')}</div>
                      </td>
                      <td>{toText(row.http_method)}</td>
                      <td className="text-break">{toText(row.uri)}</td>
                      <td>{actionLabel(row.action)}</td>
                      <td>{toText(row.resource_id ?? row.response_id)}</td>
                      <td>{toText(row.status_code)}</td>
                      <td className="text-nowrap">{toText(row.ip_origin)}</td>
                      <td className="text-end">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSelected(row)}>
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span className="small text-body-secondary">{total} registro(s)</span>
            <nav aria-label="Paginação">
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
                      <button type="button" className="page-link" aria-current={tok === page ? 'page' : undefined} onClick={() => setPage(tok)}>
                        {tok}
                      </button>
                    </li>
                  ),
                )}
                <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
                  <button type="button" className="page-link" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {selected && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="audit-detail-title">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h5" id="audit-detail-title">
                    Registro #{toText(selected.id)} — {eventMeta(selected.event_type).label}
                  </h2>
                  <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setSelected(null)} />
                </div>
                <div className="modal-body">
                  <dl className="row mb-3">
                    <DetailItem label="Data/hora" value={formatMoment(selected.created_at)} />
                    <DetailItem label="Usuário" value={`${toText(selected.login)} (id ${toText(selected.user_id)})`} />
                    <DetailItem label="Nome completo" value={toText(selected.full_name)} />
                    <DetailItem label="Perfil" value={toText(selected.profile)} />
                    <DetailItem label="Empresa" value={toText(selected.company_name)} />
                    <DetailItem label="Método / rota" value={`${toText(selected.http_method)} ${toText(selected.uri)}`} />
                    <DetailItem label="Ação / recurso" value={`${actionLabel(selected.action)} / ${toText(selected.resource)}`} />
                    <DetailItem label="ID afetado" value={toText(selected.resource_id)} />
                    <DetailItem label="ID criado (resposta)" value={toText(selected.response_id)} />
                    <DetailItem label="Status HTTP" value={toText(selected.status_code)} />
                    <DetailItem label="IP de origem" value={toText(selected.ip_origin)} />
                    <DetailItem label="IP de destino" value={toText(selected.ip_destination)} />
                    <DetailItem label="Sessão" value={toText(selected.session_id)} />
                    <DetailItem label="Navegador" value={toText(selected.user_agent)} />
                    <DetailItem label="Detalhes" value={toText(selected.details)} />
                  </dl>
                  <h3 className="h6">Busca (querystring bruta)</h3>
                  <pre className="border rounded p-2 small text-break" style={{ whiteSpace: 'pre-wrap' }}>{toText(selected.query_raw)}</pre>
                  <h3 className="h6">Corpo enviado (RAW)</h3>
                  <pre className="border rounded p-2 small mb-0" style={{ whiteSpace: 'pre-wrap' }}>{prettyPayload(selected.payload_raw)}</pre>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Fechar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="col-sm-4">{label}</dt>
      <dd className="col-sm-8 text-break">{value}</dd>
    </>
  );
}
