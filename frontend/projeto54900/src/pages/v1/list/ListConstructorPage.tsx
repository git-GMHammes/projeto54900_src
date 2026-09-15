// Preview do "Construtor de Listas" — le list_manager/list_columns/list_actions
// (ver README_list_constructor.md) e renderiza uma grid de verdade a partir da
// definicao gravada no banco, com dados reais buscados no api_get_endpoint do
// manager escolhido.
//
// Espelha o padrao REST do backend:
//   /v1/list-constructor -> esta pagina (get-all dos 3 managers semeados)
//
// So preview/leitura: nao cria/edita list_manager/list_columns/list_actions
// pela UI (isso e o ListBuilderPage, /v1/list-constructor/create — botao
// "Nova lista" abaixo). Cliques em acoes (list_actions) NUNCA executam de
// verdade — so mostram um toast com o que seria chamado, porque (a) alguns
// hrefs sao de outro projeto (/web/v1a/...) e nao existem neste app, e (b)
// evita mutar dados reais de user-manager num clique de demonstracao.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { paths } from '@/routes/paths';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { paginationWindow } from '@/utils/pagination';
import type { QueryParams } from '@/types/api';
import {
  str,
  toManager,
  toColumn,
  toAction,
  renderCell,
  evalBusinessRule,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';

// -----------------------------------------------------------------------------
// Pagina
// -----------------------------------------------------------------------------

export default function ListConstructorPage() {
  const toast = useToast();
  const { params, setPage, setLimit, toggleSort } = usePagination();

  const [managers, setManagers] = useState<ListManagerRow[]>([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(false);

  const [dataRows, setDataRows] = useState<Record<string, unknown>[]>([]);
  const [dataTotal, setDataTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const manager = useMemo(
    () => managers.find((m) => m.slug === selectedSlug) ?? null,
    [managers, selectedSlug],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(dataTotal / params.limit)),
    [dataTotal, params.limit],
  );

  // 1) Carrega os list_manager semeados.
  const loadManagers = useCallback(async () => {
    setManagersLoading(true);
    setManagersError(null);
    try {
      const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows } = normalizeList<Record<string, unknown>>(raw);
      const list = rows.map(toManager).filter((m) => m.id > 0);
      setManagers(list);
      setSelectedSlug((prev) => prev ?? list[0]?.slug ?? null);
    } catch (err) {
      setManagers([]);
      setManagersError(err instanceof ApiError ? err.message : 'Falha ao carregar as listagens.');
    } finally {
      setManagersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  // 2) Ao trocar de listagem, carrega as definicoes de coluna/acao dela.
  useEffect(() => {
    if (!manager) {
      setColumns([]);
      setActions([]);
      return;
    }
    let cancelled = false;
    setDefsLoading(true);
    void (async () => {
      try {
        const [colsRaw, actsRaw] = await Promise.all([
          listColumnsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
          listActionsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        ]);
        if (cancelled) return;
        setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
        setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
      } catch {
        if (!cancelled) {
          setColumns([]);
          setActions([]);
        }
      } finally {
        if (!cancelled) setDefsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manager]);

  // 3) Busca os dados reais no api_get_endpoint do manager (paginacao/sort da URL).
  useEffect(() => {
    if (!manager?.apiGetEndpoint) {
      setDataRows([]);
      setDataTotal(0);
      setDataError(manager ? 'Esta listagem nao tem api_get_endpoint definido.' : null);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    void (async () => {
      try {
        const path = resolveEndpoint(manager.apiGetEndpoint);
        const raw = await http.get(path, { params: params as unknown as QueryParams });
        if (cancelled) return;
        const { rows, total } = normalizeList<Record<string, unknown>>(raw);
        setDataRows(rows);
        setDataTotal(total);
      } catch (err) {
        if (cancelled) return;
        setDataRows([]);
        setDataTotal(0);
        setDataError(
          err instanceof ApiError
            ? `${err.message} (endpoint ${manager.apiGetEndpoint} nao existe neste projeto — normal para listas de exemplo)`
            : 'Falha ao carregar os dados.',
        );
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manager, params]);

  const handleSelectManager = (slug: string) => {
    setSelectedSlug(slug);
    setPage(1);
  };

  const handleActionClick = (action: ListActionRow, row: Record<string, unknown>) => {
    const target =
      action.actionType === 'link'
        ? action.hrefTemplate.replace('{id}', str(row.id))
        : `${action.httpMethod} ${action.apiEndpoint.replace('{id}', str(row.id))}`;
    toast.info(`Pre-visualizacao — nao executa de verdade. Chamaria: ${target}`, {
      title: action.label,
    });
  };

  return (
    <>
      <PageHeader
        title="Construtor de Listas — preview"
        subtitle="api/v1/list-manager · api/v1/list-columns · api/v1/list-actions"
      >
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadManagers()} disabled={managersLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.list.create}>
          Nova lista
        </Link>
      </PageHeader>

      {managersLoading && <LoadingOverlay />}

      {managersError && !managersLoading && (
        <EmptyState title="Listagens indisponiveis" description={managersError} variant="danger" />
      )}

      {!managersLoading && !managersError && managers.length === 0 && (
        <EmptyState
          title="Nenhuma listagem semeada"
          description="Rode: podman exec codeigniter54900_php php spark db:seed ListConstructorRealTablesSeeder"
        />
      )}

      {!managersLoading && !managersError && managers.length > 0 && (
        <>
          <div className="mb-4" style={{ maxWidth: '24rem' }}>
            <label htmlFor="list-constructor-select" className="form-label small text-body-secondary mb-1">
              Escolher listagem
            </label>
            <select
              id="list-constructor-select"
              className="form-select"
              value={selectedSlug ?? ''}
              onChange={(e) => handleSelectManager(e.target.value)}
            >
              {managers.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.title} ({m.slug})
                </option>
              ))}
            </select>
          </div>

          {manager && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <h2 className="h6 mb-0">
                        list_manager · <code>{manager.slug}</code>{' '}
                        <span className="badge text-bg-light border">{manager.status}</span>
                      </h2>
                      <Link className="btn btn-sm btn-outline-secondary" to={paths.v1.list.edit(manager.id)}>
                        Editar
                      </Link>
                    </div>
                    {manager.description && <p className="text-body-secondary mb-2">{manager.description}</p>}
                    <dl className="row small mb-0">
                      <dt className="col-sm-3">api_get_endpoint</dt>
                      <dd className="col-sm-9"><code>{manager.apiGetEndpoint || '—'}</code></dd>
                      <dt className="col-sm-3">roles</dt>
                      <dd className="col-sm-9">{manager.roles.length ? manager.roles.join(', ') : '—'}</dd>
                      <dt className="col-sm-3">default_sort / order / limit</dt>
                      <dd className="col-sm-9">
                        {manager.defaultSort} · {manager.defaultOrder} · {manager.defaultLimit}
                        {manager.limitOptions.length > 0 && ` (opcoes: ${manager.limitOptions.join(', ')})`}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h2 className="h6 mb-3">list_columns ({columns.length})</h2>
                    {defsLoading ? (
                      <LoadingOverlay />
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Label</th>
                              <th>Campo / concat</th>
                              <th>Formato</th>
                              <th>Sort</th>
                            </tr>
                          </thead>
                          <tbody>
                            {columns.map((c) => (
                              <tr key={c.id}>
                                <td>{c.label}</td>
                                <td className="small">
                                  {c.concat ? (
                                    <code>{c.concat.map((p) => (p.type === 'field' ? `{${p.key}}` : p.value)).join('')}</code>
                                  ) : (
                                    <code>{c.fieldKey}</code>
                                  )}
                                </td>
                                <td><span className="badge text-bg-light border">{c.format}</span></td>
                                <td>{c.sortable ? <code>{c.sortKey}</code> : <span className="text-body-secondary">—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h2 className="h6 mb-3">list_actions ({actions.length})</h2>
                    {defsLoading ? (
                      <LoadingOverlay />
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Label</th>
                              <th>Tipo</th>
                              <th>Alvo</th>
                              <th>Roles / regra</th>
                            </tr>
                          </thead>
                          <tbody>
                            {actions.map((a) => (
                              <tr key={a.id}>
                                <td>{a.label}</td>
                                <td><span className="badge text-bg-light border">{a.actionType}</span></td>
                                <td className="small"><code>{a.actionType === 'link' ? a.hrefTemplate : `${a.httpMethod} ${a.apiEndpoint}`}</code></td>
                                <td className="small">
                                  {a.roles.length > 0 && <div>roles: {a.roles.join(', ')}</div>}
                                  {a.businessRule && (
                                    <div className="text-body-secondary">
                                      regra: {a.businessRule.field} {a.businessRule.op} {String(a.businessRule.value)}
                                    </div>
                                  )}
                                  {a.roles.length === 0 && !a.businessRule && '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Grid renderizada — dados reais de {manager.apiGetEndpoint || '—'}</span>
                    {dataTotal > 0 && <span className="text-body-secondary small">{dataTotal} registro(s)</span>}
                  </div>
                  <div className="card-body p-0 position-relative">
                    {dataLoading && <LoadingOverlay overlay />}

                    {dataError && !dataLoading && (
                      <div className="p-4">
                        <EmptyState title="Nao foi possivel carregar os dados" description={dataError} variant="danger" />
                      </div>
                    )}

                    {!dataLoading && !dataError && dataRows.length === 0 && (
                      <div className="p-4">
                        <EmptyState title="Nenhum registro" />
                      </div>
                    )}

                    {!dataLoading && !dataError && dataRows.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              {columns.map((c) => (
                                <th
                                  key={c.id}
                                  role={c.sortable ? 'button' : undefined}
                                  onClick={c.sortable ? () => toggleSort(c.sortKey) : undefined}
                                  className={c.sortable ? 'user-select-none' : undefined}
                                >
                                  {c.label}
                                  {c.sortable && params.sort === c.sortKey && (
                                    <span className="ms-1">{params.order === 'ASC' ? '▲' : '▼'}</span>
                                  )}
                                </th>
                              ))}
                              {actions.length > 0 && <th className="text-end">Acoes</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {dataRows.map((row, i) => (
                              <tr key={str(row.id) || i}>
                                {columns.map((c) => (
                                  <td key={c.id}>{renderCell(c, row)}</td>
                                ))}
                                {actions.length > 0 && (
                                  <td className="text-end text-nowrap">
                                    {actions.map((a) => {
                                      const allowed = evalBusinessRule(a.businessRule, row);
                                      return (
                                        <button
                                          key={a.id}
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary ms-2"
                                          disabled={!allowed}
                                          title={
                                            allowed
                                              ? a.label
                                              : `${a.label} — bloqueado pela regra (${a.businessRule?.field} ${a.businessRule?.op} ${String(a.businessRule?.value)})`
                                          }
                                          onClick={() => handleActionClick(a, row)}
                                        >
                                          {a.label}
                                        </button>
                                      );
                                    })}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2 small text-body-secondary">
                      <span>Por pagina</span>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={params.limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                      >
                        {(manager.limitOptions.length > 0 ? manager.limitOptions : [10, 20, 50, 100]).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <nav aria-label="Paginação">
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item${params.page <= 1 ? ' disabled' : ''}`}>
                          <button
                            type="button"
                            className="page-link"
                            disabled={params.page <= 1}
                            onClick={() => setPage(params.page - 1)}
                          >
                            Anterior
                          </button>
                        </li>
                        {paginationWindow(params.page, totalPages).map((tok, i) =>
                          tok === '...' ? (
                            <li key={`ellipsis-${i}`} className="page-item disabled">
                              <span className="page-link">…</span>
                            </li>
                          ) : (
                            <li key={tok} className={`page-item${tok === params.page ? ' active' : ''}`}>
                              <button
                                type="button"
                                className="page-link"
                                aria-current={tok === params.page ? 'page' : undefined}
                                onClick={() => setPage(tok)}
                              >
                                {tok}
                              </button>
                            </li>
                          ),
                        )}
                        <li className={`page-item${params.page >= totalPages ? ' disabled' : ''}`}>
                          <button
                            type="button"
                            className="page-link"
                            disabled={params.page >= totalPages}
                            onClick={() => setPage(params.page + 1)}
                          >
                            Próxima
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
