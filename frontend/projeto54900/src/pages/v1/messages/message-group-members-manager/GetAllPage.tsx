// Lista de Grupos <-> Membros (view_message_group_memberships) — api/v1/message-group-memberships-view.
// Uma linha por grupo, com dono, quantidade e nomes dos membros ativos. Message NAO e chat.
//
// Consumidor do MOTOR DE LISTAGENS (slug 'message-group-members-manager'): colunas e acoes
// vem do BANCO. Acoes: Editar membros (link para a UpdatePage — tela de 2 cards) e Excluir
// (DELETE soft do grupo). O botao "Novo" abre o modal de 2 etapas (CreateModal: grupo + membros).
// Quem pode alterar (so o dono ou admin) e decidido pelo backend (403 vira toast).
//
// Padrao espelhado de pages/v1/messages/message-groups-manager/GetAllPage.tsx.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useAuth } from '@/context/AuthContext';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { paginationWindow } from '@/utils/pagination';
import type { QueryParams } from '@/types/api';
import {
  str,
  toManager,
  toColumn,
  toAction,
  cellValue,
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';
import { notifyActionDone } from '@/utils/listActionToast';
import CreateModal from './CreateModal';

/** Slug do list_manager que descreve esta tela (o resto da lista vem do banco). */
const MANAGER_SLUG = 'message-group-members-manager';

function ActionButton({
  action,
  row,
  subject,
  disabled,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  /** Valor da 1a coluna da linha (ex.: sala) — compoe o texto do tooltip. */
  subject: string;
  disabled: boolean;
  onExecuted: () => void;
}) {
  const toast = useToast();

  const content = action.icon ? <i className={`bi bi-${action.icon}`} aria-hidden="true" /> : action.label;
  const tip = `${action.label}${subject ? `: ${subject}` : ''}${disabled ? ' (indisponivel)' : ''}`;

  const withTooltip = (button: ReactNode) => (
    <span className="icon-action-tooltip ms-2">
      {button}
      <span className="icon-action-tooltip-bubble icon-action-tooltip-bubble--start" role="tooltip">
        {tip}
      </span>
    </span>
  );

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return withTooltip(
      <Link
        className={`btn btn-sm btn-outline-primary${disabled ? ' disabled' : ''}`}
        to={href}
        aria-label={tip}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        {content}
      </Link>,
    );
  }

  if (action.actionType === 'modal') {
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        aria-label={tip}
        disabled={disabled}
        onClick={() =>
          toast.error(`Acao '${action.dataAction || action.label}' sem tratamento nesta lista.`, {
            title: action.label,
          })
        }
      >
        {content}
      </button>,
    );
  }

  const execute = async () => {
    if (action.confirm && !window.confirm(action.confirmMessage || `Confirma ${action.label}?`)) {
      return;
    }
    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      // extraData (list_actions.extra_data_json) e o corpo fixo de uma acao
      // de mudanca de status (ex.: {"status":"removed"}) — so faz sentido em
      // metodos com corpo.
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path, action.extraData ?? undefined);
      else if (method === 'PATCH') await http.patch(path, action.extraData ?? undefined);
      else if (method === 'POST') await http.post(path, action.extraData ?? undefined);
      else await http.get(path);
      notifyActionDone(toast, action, subject);
      onExecuted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a acao.', { title: action.label });
    }
  };

  return withTooltip(
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      aria-label={tip}
      disabled={disabled}
      onClick={() => void execute()}
    >
      {content}
    </button>,
  );
}

export default function GetAllPage() {
  const { params, setPage, setLimit, toggleSort } = usePagination();

  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actionsAll, setActionsAll] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  // Ação sem `roles` vale para todos; com `roles`, só quem tem o papel (ex.: Editar = admin).
  const userRole = user?.role?.slug ?? '';
  const actions = useMemo(
    () => actionsAll.filter((a) => a.roles.length === 0 || (userRole !== '' && a.roles.includes(userRole))),
    [actionsAll, userRole],
  );
  const [defsError, setDefsError] = useState<string | null>(null);

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  const loadDefinition = useCallback(async () => {
    setDefsLoading(true);
    setDefsError(null);
    try {
      const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows: managerRows } = normalizeList<Record<string, unknown>>(raw);
      const found = managerRows.map(toManager).find((m) => m.slug === MANAGER_SLUG) ?? null;

      if (!found) {
        setManager(null);
        setDefsError(`Listagem '${MANAGER_SLUG}' nao encontrada em list_manager.`);
        return;
      }
      setManager(found);

      const [colsRaw, actsRaw] = await Promise.all([
        listColumnsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        listActionsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
      ]);
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
      setActionsAll(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definicao da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();

  const prevTerm = useRef(term);
  useEffect(() => {
    if (prevTerm.current === term) return;
    prevTerm.current = term;
    if (params.page !== 1) setPage(1);
  }, [term, params.page, setPage]);

  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    if (!manager?.apiGetEndpoint) return;
    const seq = ++requestSeq.current;
    const searching = term !== '' && manager.apiSearchEndpoint !== '';
    setDataLoading(true);
    setDataError(null);
    try {
      const path = resolveEndpoint(searching ? manager.apiSearchEndpoint : manager.apiGetEndpoint);
      const query: QueryParams = searching ? { ...params, q: term } : { ...params };
      const raw = await http.get(path, { params: query });
      if (seq !== requestSeq.current) return;
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os grupos e membros.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || 'Membros dos Grupos'} subtitle={manager?.apiGetEndpoint || 'api/v1/message-group-memberships-view'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          Novo
        </button>
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {!defsLoading && !defsError && (
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por grupo, dono ou membro"
              aria-label="Buscar grupos"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput !== '' && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Limpar busca"
                onClick={() => setSearchInput('')}
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 &&
        (term !== '' ? (
          <EmptyState
            variant="warning"
            eyebrow="Busca"
            title="Nenhum registro encontrado"
            description={`Nada corresponde a '${searchInput.trim()}'.`}
          />
        ) : (
          <EmptyState title="Nenhum grupo encontrado" description="Use Novo para criar o primeiro grupo e escolher os membros." />
        ))}

      {!defsLoading && !error && (dataLoading || rows.length > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {dataLoading && <LoadingOverlay overlay />}

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
                {rows.map((row, i) => (
                  <tr key={str(row.id) || i}>
                    {columns.map((c) => (
                      <td key={c.id}>{renderCell(c, row)}</td>
                    ))}
                    {actions.length > 0 && (
                      <td className="text-end text-nowrap">
                        {actions.map((a) => (
                          <ActionButton
                            key={a.id}
                            action={a}
                            row={row}
                            subject={columns[0] ? cellValue(columns[0], row) : ''}
                            disabled={!evalBusinessRule(a.businessRule, row)}
                            onExecuted={() => void loadData()}
                          />
                        ))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{total} registro(s) · Por página</span>
              <select
                className="form-select form-select-sm w-auto"
                value={params.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {(manager?.limitOptions.length ? manager.limitOptions : [10, 20, 50, 100]).map((n) => (
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
      )}

      <CreateModal
        open={createOpen}
        onClose={(changed) => {
          setCreateOpen(false);
          if (changed) void loadData();
        }}
      />
    </>
  );
}
