// Lista de itens de menu (menu_manager) — index do modulo menu-manager.
//
// Fork de GetAllPage.tsx (user-manager/nav), mesmo padrao de producao do
// motor "Construtor de Listas" — list_manager/list_columns/list_actions ->
// ver README_list_constructor.md: colunas e acoes do MODO TABELA nao estao
// fixas no codigo, vem da definicao gravada no banco (list_manager de slug
// 'menu', table_name = menu_manager).
//
// Diferenca pro fork padrao: aceita ?nav_manager_id= na querystring pra
// restringir aos itens de UM nav (usado pelo botao "Itens" do modulo nav) —
// nesse caso busca TODOS os itens desse nav (sem paginacao) e renderiza como
// ARVORE indentada respeitando parent_id. O motor generico so sabe desenhar
// <table> simples (sem recursao), entao o MODO ARVORE continua com layout
// proprio (MenuTreeRow) — mas as ACOES (Ver/Excluir) de cada no vem da mesma
// definicao de list_actions usada no modo tabela, nao ficam mais hardcoded.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable, listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { http, ApiError } from '@/services/http';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { toText } from '@/utils/format';
import type { ApiRow, QueryParams } from '@/types/api';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import {
  str,
  toManager,
  toColumn,
  toAction,
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';

const MANAGER_SLUG = 'menu';

// -----------------------------------------------------------------------------
// Botao de acao — link real (react-router) ou chamada HTTP real (api_call).
// Reaproveitado tanto na tabela quanto nas linhas da arvore.
// -----------------------------------------------------------------------------

function ActionButton({
  action,
  row,
  disabled,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  disabled: boolean;
  onExecuted: () => void;
}) {
  const toast = useToast();

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return (
      <Link
        className={`btn btn-sm btn-outline-primary ms-2${disabled ? ' disabled' : ''}`}
        to={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        {action.label}
      </Link>
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

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-danger ms-2"
      disabled={disabled}
      onClick={() => void execute()}
    >
      {action.label}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Modo arvore (?nav_manager_id=) — layout proprio, acoes vem de list_actions
// -----------------------------------------------------------------------------

interface MenuTreeNode {
  row: ApiRow;
  children: MenuTreeNode[];
}

function idKey(value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}

function buildMenuTree(rows: ApiRow[]): MenuTreeNode[] {
  const byId = new Map<string, MenuTreeNode>();
  rows.forEach((row) => {
    const key = idKey(row.id);
    if (key) byId.set(key, { row, children: [] });
  });

  const roots: MenuTreeNode[] = [];
  rows.forEach((row) => {
    const key = idKey(row.id);
    const node = key ? byId.get(key) : undefined;
    if (!node) return;
    const parentKey = idKey(row.parent_id);
    const parent = parentKey ? byId.get(parentKey) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const bySortOrder = (a: MenuTreeNode, b: MenuTreeNode): number =>
    Number(a.row.sort_order ?? 0) - Number(b.row.sort_order ?? 0);
  const sortRecursive = (nodes: MenuTreeNode[]): void => {
    nodes.sort(bySortOrder);
    nodes.forEach((node) => sortRecursive(node.children));
  };
  sortRecursive(roots);

  return roots;
}

function MenuTreeRow({
  node,
  depth,
  actions,
  onExecuted,
}: {
  node: MenuTreeNode;
  depth: number;
  actions: ListActionRow[];
  onExecuted: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { row, children } = node;
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className="d-flex align-items-center gap-2 rounded px-2 py-1 border-bottom"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <button
          type="button"
          className="btn btn-sm btn-link p-0 text-decoration-none"
          style={{ width: '1.25rem', visibility: hasChildren ? 'visible' : 'hidden' }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Recolher' : 'Expandir'}
        >
          <i className={`bi ${open ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
        </button>
        <span className="fw-semibold">{toText(row.title)}</span>
        {row.react_route ? (
          <code className="text-body-secondary small">{toText(row.react_route)}</code>
        ) : null}
        {renderCell({ id: 0, sortOrder: 0, label: '', fieldKey: 'status', concat: null, format: 'status-badge', fallback: '—', sortable: false, sortKey: 'status' }, row)}
        {renderCell({ id: 0, sortOrder: 0, label: '', fieldKey: 'roles', concat: null, format: 'roles-badges', fallback: '—', sortable: false, sortKey: 'roles' }, row)}
        {hasChildren && (
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
            {children.length}
          </span>
        )}
        <div className="ms-auto d-flex">
          {actions.map((a) => (
            <ActionButton
              key={a.id}
              action={a}
              row={row}
              disabled={!evalBusinessRule(a.businessRule, row)}
              onExecuted={onExecuted}
            />
          ))}
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {children.map((child) => (
            <MenuTreeRow key={toText(child.row.id)} node={child} depth={depth + 1} actions={actions} onExecuted={onExecuted} />
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Pagina
// -----------------------------------------------------------------------------

export default function GetAllPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navManagerId = searchParams.get('nav_manager_id');
  const isTreeMode = navManagerId !== null;
  const { params, setPage, setLimit, toggleSort } = usePagination();

  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // 1) Carrega a definicao (list_manager + list_columns + list_actions) do slug menu.
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

  // 2a) Modo tabela — dados reais via manager.apiGetEndpoint (paginacao/sort da URL).
  const [flatRows, setFlatRows] = useState<Record<string, unknown>[]>([]);
  const [flatTotal, setFlatTotal] = useState(0);
  const [flatLoading, setFlatLoading] = useState(false);
  const [flatError, setFlatError] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(flatTotal / params.limit)), [flatTotal, params.limit]);

  const loadFlat = useCallback(async () => {
    if (isTreeMode || !manager?.apiGetEndpoint) return;
    setFlatLoading(true);
    setFlatError(null);
    try {
      const path = resolveEndpoint(manager.apiGetEndpoint);
      const raw = await http.get(path, { params: params as unknown as QueryParams });
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setFlatRows(list);
      setFlatTotal(t);
    } catch (err) {
      setFlatRows([]);
      setFlatTotal(0);
      setFlatError(err instanceof ApiError ? err.message : 'Falha ao carregar os itens de menu.');
    } finally {
      setFlatLoading(false);
    }
  }, [isTreeMode, manager, params]);

  useEffect(() => {
    void loadFlat();
  }, [loadFlat]);

  // 2b) Modo arvore — TODOS os itens de UM nav (sem paginacao), arvore por parent_id.
  const { data: treeData, error: treeApiError, loading: treeLoading, run: runTree } = useApi((signal) =>
    menuManagerTable.find(
      { nav_manager_id: Number(navManagerId) },
      { limit: 200, sort: 'sort_order', order: 'ASC' },
      { signal },
    ),
  );

  useEffect(() => {
    if (isTreeMode) void runTree();
  }, [isTreeMode, navManagerId, runTree]);

  const { rows: treeRows } = normalizeList<ApiRow>(treeData);
  const tree = useMemo(() => (isTreeMode ? buildMenuTree(treeRows) : []), [isTreeMode, treeRows]);

  const dataLoading = isTreeMode ? treeLoading : flatLoading;
  const dataError = isTreeMode ? treeApiError?.message ?? null : flatError;
  const rows = isTreeMode ? treeRows : flatRows;
  const reload = isTreeMode ? () => void runTree() : () => void loadFlat();

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader
        title={navManagerId ? `Itens do nav #${navManagerId}` : manager?.title || 'Itens de menu'}
        subtitle={navManagerId ? `api/v1/menu-manager?nav_manager_id=${navManagerId}` : manager?.apiGetEndpoint || 'api/v1/menu-manager'}
      >
        {navManagerId && (
          <Link className="btn btn-outline-secondary" to={paths.v1.nav.view(navManagerId)}>
            Voltar ao nav
          </Link>
        )}
        <button
          className="btn btn-primary"
          onClick={() =>
            void navigate(navManagerId ? paths.v1.menu.createForNav(navManagerId) : paths.v1.menu.create)
          }
        >
          Novo item
        </button>
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow="Lista vazia"
          title="Nenhum item cadastrado"
          description="Crie o primeiro item para comecar."
        />
      )}

      {!defsLoading && !error && !dataLoading && rows.length > 0 && isTreeMode && (
        <div className="border rounded">
          {tree.map((node) => (
            <MenuTreeRow key={toText(node.row.id)} node={node} depth={0} actions={actions} onExecuted={reload} />
          ))}
        </div>
      )}

      {!defsLoading && !error && !isTreeMode && (dataLoading || rows.length > 0) && (
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
                {flatRows.map((row, i) => (
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
                            disabled={!evalBusinessRule(a.businessRule, row)}
                            onExecuted={reload}
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
              <span>{flatTotal} registro(s) · Por pagina</span>
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
    </>
  );
}
