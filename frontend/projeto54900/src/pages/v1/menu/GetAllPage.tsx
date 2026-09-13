// Lista de itens de menu — api/v1/menu-manager/get-all (ou /find quando filtrado)
//
// Aceita ?nav_manager_id= na querystring para restringir aos itens de UM nav
// (usado pelo botao "Itens"/"Ver itens" do modulo nav). Com o parametro, busca
// TODOS os itens desse nav (sem paginacao) e renderiza como arvore indentada,
// respeitando parent_id. Sem o parametro, lista todos os itens de todos os
// navs na tabela plana + paginacao de sempre.
//
// Tabela self-contained (nao usa o DataTable/Pagination compartilhados —
// ambos estao stubados aguardando a fabrica de listas).

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { normalizeList } from '@/utils/apiResult';
import { parseStringList } from '@/utils/jsonList';
import { toText } from '@/utils/format';
import type { ApiRow } from '@/types/api';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import ConfirmModal from '@/components/global/ConfirmModal';

const STATUS_BADGE: Record<string, string> = {
  active: 'text-bg-success',
  draft: 'text-bg-secondary',
  inactive: 'text-bg-danger',
};

function StatusBadge({ status }: { status: unknown }) {
  const s = toText(status, '');
  return <span className={`badge ${STATUS_BADGE[s] ?? 'text-bg-secondary'}`}>{s || '-'}</span>;
}

function RolesBadges({ roles }: { roles: unknown }) {
  const list = parseStringList(typeof roles === 'string' ? roles : '');
  if (list.length === 0) return <span className="text-body-secondary">-</span>;
  return (
    <div className="d-flex flex-wrap gap-1">
      {list.map((role) => (
        <span className="badge text-bg-light border" key={role}>
          {role}
        </span>
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

function MenuTreeRow({
  node,
  depth,
  onDelete,
}: {
  node: MenuTreeNode;
  depth: number;
  onDelete: (row: ApiRow) => void;
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
        <StatusBadge status={row.status} />
        <RolesBadges roles={row.roles} />
        {hasChildren && (
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
            {children.length}
          </span>
        )}
        <div className="btn-group btn-group-sm ms-auto">
          <Link className="btn btn-outline-secondary" to={paths.v1.menu.view(row.id as string | number)}>
            Ver
          </Link>
          <button className="btn btn-outline-danger" onClick={() => onDelete(row)}>
            Excluir
          </button>
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {children.map((child) => (
            <MenuTreeRow key={toText(child.row.id)} node={child} depth={depth + 1} onDelete={onDelete} />
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
  const { params, setPage, toggleSort } = usePagination();
  const [pendingDelete, setPendingDelete] = useState<ApiRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, loading, run } = useApi((signal) =>
    isTreeMode
      ? menuManagerTable.find(
          { nav_manager_id: Number(navManagerId) },
          { limit: 200, sort: 'sort_order', order: 'ASC' },
          { signal },
        )
      : menuManagerTable.getAll({ ...params }, { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, navManagerId, isTreeMode, params.page, params.limit, params.sort, params.order]);

  const { rows, total, limit } = normalizeList(data);
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  const tree = useMemo(() => (isTreeMode ? buildMenuTree(rows) : []), [isTreeMode, rows]);

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await menuManagerTable.deleteSoft(pendingDelete.id as string | number);
      const label = pendingDelete.title ? toText(pendingDelete.title) : toText(pendingDelete.id);
      toast.success(`Item "${label}" excluido.`);
      setPendingDelete(null);
      void run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir o item.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={navManagerId ? `Itens do nav #${navManagerId}` : 'Itens de menu'}
        subtitle={navManagerId ? `api/v1/menu-manager?nav_manager_id=${navManagerId}` : 'api/v1/menu-manager'}
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

      {loading && <LoadingOverlay />}

      {!loading && error && (
        <EmptyState variant="danger" title="Falha ao carregar" description={error.message}>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void run()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {!loading && !error && rows.length === 0 && (
        <EmptyState title="Nenhum item cadastrado" description="Crie o primeiro item para comecar." />
      )}

      {!loading && !error && rows.length > 0 && isTreeMode && (
        <div className="border rounded">
          {tree.map((node) => (
            <MenuTreeRow key={toText(node.row.id)} node={node} depth={0} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {!loading && !error && rows.length > 0 && !isTreeMode && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th role="button" onClick={() => toggleSort('id')}>ID</th>
                  <th role="button" onClick={() => toggleSort('title')}>Titulo</th>
                  <th>Rota</th>
                  <th>Roles</th>
                  <th role="button" onClick={() => toggleSort('status')}>Status</th>
                  <th role="button" onClick={() => toggleSort('sort_order')}>Ordem</th>
                  <th className="text-end">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={toText(row.id)}>
                    <td>{toText(row.id)}</td>
                    <td>{toText(row.title)}</td>
                    <td><code>{toText(row.react_route)}</code></td>
                    <td><RolesBadges roles={row.roles} /></td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{toText(row.sort_order, '0')}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link className="btn btn-outline-secondary" to={paths.v1.menu.view(row.id as string | number)}>
                          Ver
                        </Link>
                        <button className="btn btn-outline-danger" onClick={() => setPendingDelete(row)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === params.page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Excluir item de menu"
        message={`Tem certeza que deseja excluir o item "${toText(pendingDelete?.title, '')}"?`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
