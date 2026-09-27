// Lista de itens de menu (menu_manager) — api/v1/menu-manager
//
// Consumidor do MOTOR DE LISTAGENS (list_manager/list_columns/list_actions,
// slug 'menu'): colunas, rotulos, ordenacao e acoes vem do BANCO — nao existe
// <thead> fixo aqui. Regra em
// src/markdown/geral/README_render_via_list_constructor.md.
//
// DUAS VISOES, mesma definicao:
//   1. LISTA PLANA (/v1/menu-manager) — todos os itens de todos os navs;
//      busca e paginacao no SERVIDOR (api_get_endpoint/api_search_endpoint).
//   2. ARVORE (/v1/menu-manager?nav_manager_id=) — itens de UM nav, carregados
//      de uma vez (menu-manager/find) e montados por parent_id. Busca e
//      paginacao aqui sao LOCAIS: a busca filtra os itens mantendo os
//      ancestrais do que casou, e a paginacao recorta os itens de TOPO — um pai
//      nunca cai em pagina diferente dos filhos.
//
// Padrao visual espelhado de pages/v1/user/user-manager/GetAllPage.tsx:
//   busca  -> input-group com bi-search
//   acoes  -> botao so-icone (list_actions.icon) + tooltip custom
//   rodape -> total + seletor de limite + paginationWindow (utils/pagination)
//
// Alem das acoes de list_actions (Ver / Excluir), o item de TOPO ganha dois
// atalhos de destino (Navbar / Offcanvas) que gravam o placement no item E em
// todos os descendentes — comportamento que nao cabe em list_actions.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable, listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { http, ApiError } from '@/services/http';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { toText } from '@/utils/format';
import { paginationWindow } from '@/utils/pagination';
import type { ApiRow, QueryParams } from '@/types/api';
import type { MenuPlacement } from '@/types/menu';
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

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';

/** Slug do list_manager que descreve esta tela (colunas/acoes vem do banco). */
const MANAGER_SLUG = 'menu';

/** Teto de itens carregados de uma vez no modo arvore (um nav inteiro). */
const TREE_LIMIT = 500;

const PLACEMENT_ACTIONS: { value: MenuPlacement; icon: string; label: string }[] = [
  { value: 'navbar', icon: 'bi-menu-button-wide-fill', label: 'Mover para a Navbar' },
  { value: 'offcanvas', icon: 'bi-layout-sidebar-inset', label: 'Mover para o Offcanvas' },
];

function rowPlacement(row: ApiRow): MenuPlacement {
  return row.placement === 'offcanvas' ? 'offcanvas' : 'navbar';
}

// Tooltip custom (bolha CSS) a esquerda do botao — acoes ficam na borda
// direita (e dentro de .table-responsive na tabela plana).
function WithTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="icon-action-tooltip">
      {children}
      <span className="icon-action-tooltip-bubble icon-action-tooltip-bubble--start" role="tooltip">
        {label}
      </span>
    </span>
  );
}

/**
 * Botao de UMA acao de list_actions na linha: 'link' navega pelo react-router
 * (href_template com {campos} da linha) e 'api_call' executa HTTP de verdade no
 * api_endpoint, com confirmacao opcional. 'modal' nao existe neste slug hoje —
 * se aparecer, avisa em vez de falhar em silencio.
 */
function ActionButton({
  action,
  row,
  subject,
  disabled,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  /** Valor da 1a coluna da linha (ex.: titulo) — compoe o texto do tooltip. */
  subject: string;
  disabled: boolean;
  onExecuted: () => void;
}) {
  const toast = useToast();

  // Botao so-icone (list_actions.icon); sem icone cadastrado, cai no rotulo.
  const content = action.icon ? <i className={`bi bi-${action.icon}`} aria-hidden="true" /> : action.label;
  const tip = `${action.label}${subject ? `: ${subject}` : ''}${disabled ? ' (indisponivel)' : ''}`;

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return (
      <WithTooltip label={tip}>
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
        </Link>
      </WithTooltip>
    );
  }

  if (action.actionType === 'modal') {
    return (
      <WithTooltip label={tip}>
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
        </button>
      </WithTooltip>
    );
  }

  const execute = async () => {
    if (action.confirm && !window.confirm(action.confirmMessage || `Confirma ${action.label}?`)) {
      return;
    }
    try {
      // O endpoint do banco vem como "/api/v1/...": resolveEndpoint tira o
      // prefixo que o wrapper http ja adiciona.
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
    <WithTooltip label={tip}>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        aria-label={tip}
        disabled={disabled}
        onClick={() => void execute()}
      >
        {content}
      </button>
    </WithTooltip>
  );
}

function MenuRowActions({
  row,
  actions,
  busy,
  onPlacement,
  onExecuted,
}: {
  row: ApiRow;
  actions: ListActionRow[];
  busy: boolean;
  onPlacement: (row: ApiRow, placement: MenuPlacement) => void;
  onExecuted: () => void;
}) {
  const isRoot = row.parent_id === null || row.parent_id === undefined;
  const current = rowPlacement(row);
  const subject = toText(row.title, '');

  return (
    <div className="d-inline-flex gap-1">
      {isRoot &&
        PLACEMENT_ACTIONS.map((action) => (
          <WithTooltip
            key={action.value}
            label={
              current === action.value
                ? `Esta no ${action.value === 'navbar' ? 'Navbar' : 'Offcanvas'}`
                : `${action.label} (com submenus)`
            }
          >
            <button
              type="button"
              className={`btn btn-sm ${current === action.value ? 'btn-primary' : 'btn-outline-primary'}`}
              disabled={busy || current === action.value}
              aria-label={action.label}
              aria-pressed={current === action.value}
              onClick={() => onPlacement(row, action.value)}
            >
              <i className={`bi ${action.icon}`} aria-hidden="true" />
            </button>
          </WithTooltip>
        ))}
      {actions.map((a) => (
        <ActionButton
          key={a.id}
          action={a}
          row={row}
          subject={subject}
          disabled={busy || !evalBusinessRule(a.businessRule, row)}
          onExecuted={onExecuted}
        />
      ))}
    </div>
  );
}

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

/**
 * Mantem os itens que casam com o termo E todos os seus ancestrais — sem isso,
 * um filho encontrado pela busca apareceria solto, fora do pai.
 */
function filterTreeRows(rows: ApiRow[], term: string): ApiRow[] {
  if (term === '') return rows;
  const needle = term.toLowerCase();

  const byId = new Map<string, ApiRow>();
  rows.forEach((row) => {
    const key = idKey(row.id);
    if (key) byId.set(key, row);
  });

  const matches = (row: ApiRow): boolean =>
    `${toText(row.title)} ${toText(row.react_route)}`.toLowerCase().includes(needle);

  const keep = new Set<string>();
  rows.forEach((row) => {
    if (!matches(row)) return;
    let key = idKey(row.id);
    while (key && !keep.has(key)) {
      keep.add(key);
      key = idKey(byId.get(key)?.parent_id);
    }
  });

  return rows.filter((row) => {
    const key = idKey(row.id);
    return key !== null && keep.has(key);
  });
}

function MenuTreeRow({
  node,
  depth,
  actions,
  statusColumn,
  rolesColumn,
  busyId,
  onPlacement,
  onExecuted,
}: {
  node: MenuTreeNode;
  depth: number;
  actions: ListActionRow[];
  statusColumn: ListColumnRow | undefined;
  rolesColumn: ListColumnRow | undefined;
  busyId: string | null;
  onPlacement: (row: ApiRow, placement: MenuPlacement) => void;
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
        {statusColumn && renderCell(statusColumn, row)}
        {rolesColumn && renderCell(rolesColumn, row)}
        {hasChildren && (
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
            {children.length}
          </span>
        )}
        <div className="ms-auto">
          <MenuRowActions
            row={row}
            actions={actions}
            busy={busyId !== null}
            onPlacement={onPlacement}
            onExecuted={onExecuted}
          />
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {children.map((child) => (
            <MenuTreeRow
              key={toText(child.row.id)}
              node={child}
              depth={depth + 1}
              actions={actions}
              statusColumn={statusColumn}
              rolesColumn={rolesColumn}
              busyId={busyId}
              onPlacement={onPlacement}
              onExecuted={onExecuted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GetAllPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navManagerId = searchParams.get('nav_manager_id');
  const isTreeMode = navManagerId !== null;
  const { params, setPage, setLimit, toggleSort } = usePagination();

  // GRUPO 1 — DEFINICAO (o que a lista e), carregada uma vez no mount.
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // GRUPO 2 — DADOS listados (recarrega a cada mudanca de URL, busca ou acao).
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [placingId, setPlacingId] = useState<string | null>(null);

  // Colunas usadas pelos badges da ARVORE (a linha da arvore e flex, nao tabela).
  const statusColumn = useMemo(() => columns.find((c) => c.fieldKey === 'status'), [columns]);
  const rolesColumn = useMemo(() => columns.find((c) => c.fieldKey === 'roles'), [columns]);

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

  // Busca ao digitar. Na lista plana vai no api_search_endpoint (?q=); no modo
  // arvore e local (filtro em filterTreeRows), porque o search do backend nao
  // aceita o filtro nav_manager_id.
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();

  // Termo novo sempre recomeca da pagina 1.
  const prevTerm = useRef(term);
  useEffect(() => {
    if (prevTerm.current === term) return;
    prevTerm.current = term;
    if (params.page !== 1) setPage(1);
  }, [term, params.page, setPage]);

  // Descarta resposta de requisicao antiga (digitacao rapida / troca de pagina).
  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    // Sequenciador: so existe dado a buscar quando a definicao ja chegou.
    if (!manager?.apiGetEndpoint) return;
    const seq = ++requestSeq.current;
    setDataLoading(true);
    setDataError(null);
    try {
      if (isTreeMode) {
        // Modo arvore: carrega o nav inteiro de uma vez (busca/paginacao locais).
        const raw = await menuManagerTable.find(
          { nav_manager_id: Number(navManagerId) },
          { limit: TREE_LIMIT, sort: 'sort_order', order: 'ASC' },
        );
        if (seq !== requestSeq.current) return;
        const { rows: list } = normalizeList<Record<string, unknown>>(raw);
        setRows(list);
        setTotal(list.length);
      } else {
        const searching = term !== '' && manager.apiSearchEndpoint !== '';
        const path = resolveEndpoint(searching ? manager.apiSearchEndpoint : manager.apiGetEndpoint);
        const query: QueryParams = searching ? { ...params, q: term } : { ...params };
        const raw = await http.get(path, { params: query });
        if (seq !== requestSeq.current) return;
        const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
        setRows(list);
        setTotal(t);
      }
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os itens de menu.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term, isTreeMode, navManagerId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Arvore da pagina atual: filtra pelo termo e recorta os itens de TOPO — a
  // paginacao nunca separa um pai dos filhos.
  const tree = useMemo(
    () => (isTreeMode ? buildMenuTree(filterTreeRows(rows, term)) : []),
    [isTreeMode, rows, term],
  );
  const treePages = Math.max(1, Math.ceil(tree.length / params.limit));
  const treePage = Math.min(params.page, treePages);
  const visibleRoots = tree.slice((treePage - 1) * params.limit, treePage * params.limit);

  // Rodape unico para as duas visoes (na arvore, "registro" = item de topo).
  const page = isTreeMode ? treePage : params.page;
  const totalPages = isTreeMode ? treePages : Math.max(1, Math.ceil(total / params.limit));
  const recordCount = isTreeMode ? tree.length : total;
  const visibleCount = isTreeMode ? tree.length : rows.length;
  const searching = term !== '';
  const error = defsError ?? dataError;

  // Grava o placement no item e em todos os descendentes. Busca a arvore
  // inteira do nav (a tabela plana e paginada e pode nao ter os filhos).
  async function changePlacement(row: ApiRow, placement: MenuPlacement): Promise<void> {
    const rootId = idKey(row.id);
    if (!rootId) return;
    setPlacingId(rootId);
    try {
      const payload = await menuManagerTable.find(
        { nav_manager_id: Number(row.nav_manager_id) },
        { limit: TREE_LIMIT },
      );
      const { rows: all } = normalizeList(payload);
      const ids = [rootId];
      // for-of sobre array que cresce: o iterador tambem visita os ids
      // empurrados durante o laco (busca em largura pelos descendentes).
      for (const parentKey of ids) {
        all.forEach((item) => {
          const key = idKey(item.id);
          if (key && idKey(item.parent_id) === parentKey && !ids.includes(key)) ids.push(key);
        });
      }
      await Promise.all(ids.map((id) => menuManagerTable.update(id, { placement })));
      const destino = placement === 'offcanvas' ? 'Offcanvas' : 'Navbar';
      toast.success(`"${toText(row.title)}" e ${ids.length - 1} submenu(s) movidos para ${destino}.`);
      void loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao alterar o destino do menu.');
    } finally {
      setPlacingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={navManagerId ? `Itens do nav #${navManagerId}` : manager?.title || 'Itens de menu'}
        subtitle={
          navManagerId
            ? `api/v1/menu-manager?nav_manager_id=${navManagerId}`
            : manager?.apiGetEndpoint || 'api/v1/menu-manager'
        }
      >
        {navManagerId && (
          <Link className="btn btn-outline-secondary me-2" to={paths.v1.nav.view(navManagerId)}>
            Voltar ao nav
          </Link>
        )}
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
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

      {!defsLoading && !defsError && (
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por titulo ou rota"
              aria-label="Buscar itens de menu por titulo ou rota"
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

      {!defsLoading && !error && !dataLoading && visibleCount === 0 &&
        (searching ? (
          <EmptyState
            variant="warning"
            eyebrow="Busca"
            title="Nenhum item encontrado"
            description={`Nada corresponde a '${searchInput.trim()}'.`}
          />
        ) : (
          <EmptyState title="Nenhum item cadastrado" description="Crie o primeiro item para comecar." />
        ))}

      {!defsLoading && !error && (dataLoading || visibleCount > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {dataLoading && <LoadingOverlay overlay />}

          {isTreeMode ? (
            <div className="p-2">
              {visibleRoots.map((node) => (
                <MenuTreeRow
                  key={toText(node.row.id)}
                  node={node}
                  depth={0}
                  actions={actions}
                  statusColumn={statusColumn}
                  rolesColumn={rolesColumn}
                  busyId={placingId}
                  onPlacement={(row, placement) => void changePlacement(row, placement)}
                  onExecuted={() => void loadData()}
                />
              ))}
            </div>
          ) : (
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
          )}

          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{recordCount} registro(s) · Por página</span>
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
                <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
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
          </div>
        </div>
      )}
    </>
  );
}
