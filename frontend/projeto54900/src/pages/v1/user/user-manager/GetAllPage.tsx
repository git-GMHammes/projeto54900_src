// Lista de seguranca de usuarios (user_manager via view_user_manager), menu
// "Listar" — fork de user-profiles/GetAllPage.tsx sobre o mesmo motor do
// "Construtor de Listas" (list_manager/list_columns/list_actions, slug
// 'user-manager'). Colunas/rotulos/icones vem do banco; as acoes sao
// action_type 'modal' e o COMPORTAMENTO e escolhido aqui por
// list_actions.data_action (ACTION_HANDLERS abaixo):
//   toggle-status  -> um botao: blocked -> active; active/inactive -> blocked
//   reset-password -> ResetPasswordModal (PUT { password_hash })
//   change-role    -> ChangeRoleModal (PUT { user_role_id })
// Todas gravam em PUT /api/v1/user-manager/update/{id} (list_actions.api_endpoint).
// Ver src/markdown/geral/README_list_constructor.md.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { http, ApiError } from '@/services/http';
import { dbSchema, listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { paginationWindow } from '@/utils/pagination';
import { paths } from '@/routes/paths';
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

import ResetPasswordModal from './ResetPasswordModal';
import ChangeRoleModal from './ChangeRoleModal';

const MANAGER_SLUG = 'user-manager';

type ModalActionKey = 'toggle-status' | 'reset-password' | 'change-role';

/** Proximo status do botao unico de bloqueio: bloqueado desbloqueia, qualquer outro bloqueia. */
function nextStatus(current: string): 'active' | 'blocked' {
  return current === 'blocked' ? 'active' : 'blocked';
}

// Filtro de status: opcoes vem do enum da tabela; filtro vai na coluna da view.
const STATUS_TABLE = 'user_manager';
const STATUS_COLUMN = 'status';
const STATUS_FILTER = 'um_status';

/**
 * Termo da busca enviado em `?q=`. Whatsapp/telefone ficam gravados so com
 * digitos: termo feito apenas de digitos + mascara ( ) - + espaco — ex.:
 * "(41) 96208-0752" — vira so digitos. Com letra ou ponto (username, e-mail,
 * nome) segue como digitado.
 */
function normalizeSearchTerm(raw: string): string {
  const t = raw.trim();
  if (/\d/.test(t) && /^[\d\s()+-]+$/.test(t)) return t.replace(/\D/g, '');
  return t;
}

function ActionButton({
  action,
  row,
  subject,
  disabled,
  onExecuted,
  onOpenModal,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  /** Valor da 1a coluna da linha (ex.: username) — compoe o texto do tooltip. */
  subject: string;
  disabled: boolean;
  onExecuted: () => void;
  /** Acoes 'modal' de formulario (reset-password/change-role) abrem o modal da pagina. */
  onOpenModal: (key: ModalActionKey, row: Record<string, unknown>) => void;
}) {
  const toast = useToast();

  // toggle-status: um unico botao cujo icone/rotulo segue o status da linha
  // (bloqueado -> oferece desbloquear). Demais acoes: icone/rotulo do banco.
  const isToggle = action.actionType === 'modal' && action.dataAction === 'toggle-status';
  const blocked = str(row.um_status) === 'blocked';
  const icon = isToggle && blocked ? 'unlock-fill' : action.icon;
  const label = isToggle ? (blocked ? 'Desbloquear usuário' : 'Bloquear usuário') : action.label;

  // Botao so-icone (list_actions.icon); sem icone cadastrado, cai no rotulo.
  const content = icon ? <i className={`bi bi-${icon}`} aria-hidden="true" /> : label;
  const tip = `${label}${subject ? `: ${subject}` : ''}${disabled ? ' (indisponível)' : ''}`;

  // Tooltip custom (bolha CSS, styles/_custom.scss) em vez do `title` nativo,
  // mesmo padrao do CalendarActionButton (calendar-manager/GetAllPage.tsx).
  // O wrapper recebe o hover mesmo com o botao desabilitado. Variante --start
  // (bolha a esquerda): dentro do .table-responsive a bolha centrada acima
  // vazava pela borda direita e gerava scroll horizontal.
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
    const toggleStatus = async () => {
      const target = nextStatus(str(row.um_status));
      const question = `${target === 'blocked' ? 'Bloquear' : 'Desbloquear'} o usuário${subject ? ` ${subject}` : ''}?`;
      if (action.confirm && !window.confirm(action.confirmMessage || question)) return;
      try {
        await http.put(resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row)), { status: target });
        toast.success(target === 'blocked' ? 'Usuário bloqueado.' : 'Usuário desbloqueado.', { title: subject || label });
        onExecuted();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao alterar o status.', { title: label });
      }
    };

    const onClick = () => {
      if (action.dataAction === 'toggle-status') void toggleStatus();
      else if (action.dataAction === 'reset-password' || action.dataAction === 'change-role') {
        onOpenModal(action.dataAction, row);
      } else {
        toast.error(`Ação '${action.dataAction || action.label}' sem tratamento nesta lista.`, { title: label });
      }
    };

    return withTooltip(
      <button
        type="button"
        className={`btn btn-sm ${isToggle && !blocked ? 'btn-outline-danger' : 'btn-outline-primary'}`}
        aria-label={tip}
        disabled={disabled}
        onClick={onClick}
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
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
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
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
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
      setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
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

  // Busca ao digitar: com termo, consulta list_manager.api_search_endpoint
  // (?q=, OR LIKE nos $searchFields da view); vazio, volta ao api_get_endpoint.
  const [searchInput, setSearchInput] = useState('');
  const term = normalizeSearchTerm(useDebounce(searchInput, 400));

  // Filtro de status: opcoes = enum_values de user_manager.status via
  // db-schema/describe (nada fixo no codigo). Enviado como
  // filters[um_status] no search (whitelist $filterFields do SqlViewModel).
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  useEffect(() => {
    dbSchema
      .describe(STATUS_TABLE)
      .then((raw) => {
        const cols = normalizeItem<{ columns?: unknown }>(raw)?.columns;
        const col = Array.isArray(cols)
          ? (cols as Record<string, unknown>[]).find((c) => c.name === STATUS_COLUMN)
          : undefined;
        const values = col && Array.isArray(col.enum_values) ? col.enum_values.map(str).filter(Boolean) : [];
        setStatusOptions(values);
      })
      .catch(() => setStatusOptions([]));
  }, []);

  // Termo ou status novo sempre recomeca da pagina 1.
  const filterKey = `${term}|${status}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (params.page !== 1) setPage(1);
  }, [filterKey, params.page, setPage]);

  // Descarta resposta de requisicao antiga (digitacao rapida / troca de pagina).
  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    if (!manager?.apiGetEndpoint) return;
    const seq = ++requestSeq.current;
    const searching = (term !== '' || status !== '') && manager.apiSearchEndpoint !== '';
    setDataLoading(true);
    setDataError(null);
    try {
      const path = resolveEndpoint(searching ? manager.apiSearchEndpoint : manager.apiGetEndpoint);
      const query: QueryParams = searching
        ? { ...params, q: term, [`filters[${STATUS_FILTER}]`]: status }
        : { ...params };
      const raw = await http.get(path, { params: query });
      if (seq !== requestSeq.current) return;
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os usuarios.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term, status]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const error = defsError ?? dataError;

  // Modal aberto (reset-password/change-role) + linha alvo; null = fechado.
  const [modal, setModal] = useState<{ key: ModalActionKey; row: Record<string, unknown> } | null>(null);
  const closeModal = useCallback(() => setModal(null), []);
  const modalUsername = modal ? str(modal.row.um_username) : '';

  return (
    <>
      <PageHeader title={manager?.title || 'Usuarios'} subtitle={manager?.apiGetEndpoint || 'api/v1/user-manager-view'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.user.create}>
          Novo usuario
        </Link>
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {!defsLoading && !defsError && (
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" aria-hidden="true" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Usuário, nome, e-mail ou WhatsApp"
                aria-label="Buscar usuarios por usuario, nome, e-mail ou WhatsApp"
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
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              aria-label="Filtrar por status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        term !== '' || status !== '' ? (
          <EmptyState
            variant="warning"
            eyebrow="Busca"
            title="Nenhum usuario encontrado"
            description={`Nada corresponde a ${[
              term !== '' ? `termo '${searchInput.trim()}'` : '',
              status !== '' ? `status '${status}'` : '',
            ]
              .filter(Boolean)
              .join(' e ')}.`}
          />
        ) : (
          <EmptyState
            variant="warning"
            eyebrow="Lista vazia"
            title="Nenhum usuario"
            description="Crie o primeiro em 'Novo usuario'."
          />
        )
      )}

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
                            onOpenModal={(key, target) => setModal({ key, row: target })}
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
              <span>{total} registro(s) · Por pagina</span>
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

      <ResetPasswordModal
        userId={modal?.key === 'reset-password' ? str(modal.row.id) : null}
        username={modalUsername}
        onClose={closeModal}
        onSaved={() => void loadData()}
      />
      <ChangeRoleModal
        userId={modal?.key === 'change-role' ? str(modal.row.id) : null}
        username={modalUsername}
        currentRoleId={modal ? str(modal.row.um_user_role_id) : ''}
        onClose={closeModal}
        onSaved={() => void loadData()}
      />
    </>
  );
}
