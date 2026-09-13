// Lista de configs de nav — api/v1/nav-manager/get-all
//
// Tabela self-contained (nao usa o DataTable/Pagination compartilhados —
// ambos estao stubados aguardando a fabrica de listas). Paginacao/ordenacao
// via usePagination (URL e a fonte da verdade).

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { navManagerTable } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { normalizeList } from '@/utils/apiResult';
import { formatDateTime, toText } from '@/utils/format';
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

function SortableHeader({
  column,
  label,
  sort,
  order,
  onToggle,
}: {
  column: string;
  label: string;
  sort: string;
  order: string;
  onToggle: (column: string) => void;
}) {
  const active = sort === column;
  return (
    <th
      role="button"
      className="user-select-none"
      onClick={() => onToggle(column)}
      aria-sort={active ? (order === 'ASC' ? 'ascending' : 'descending') : 'none'}
    >
      {label} {active && <span aria-hidden="true">{order === 'ASC' ? '▲' : '▼'}</span>}
    </th>
  );
}

export default function GetAllPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { params, setPage, toggleSort } = usePagination();
  const [pendingDelete, setPendingDelete] = useState<ApiRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, loading, run } = useApi((signal) =>
    navManagerTable.getAll({ ...params }, { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, params.page, params.limit, params.sort, params.order]);

  const { rows, total, limit } = normalizeList(data);
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await navManagerTable.deleteSoft(pendingDelete.id as string | number);
      const label = pendingDelete.title ? toText(pendingDelete.title) : toText(pendingDelete.id);
      toast.success(`Nav "${label}" excluido.`);
      setPendingDelete(null);
      void run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir o nav.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Nav" subtitle="api/v1/nav-manager">
        <button className="btn btn-primary" onClick={() => void navigate(paths.v1.nav.create)}>
          Novo nav
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
        <EmptyState title="Nenhum nav cadastrado" description="Crie o primeiro nav para comecar." />
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <SortableHeader column="id" label="ID" sort={params.sort} order={params.order} onToggle={toggleSort} />
                  <SortableHeader column="title" label="Titulo" sort={params.sort} order={params.order} onToggle={toggleSort} />
                  <SortableHeader column="status" label="Status" sort={params.sort} order={params.order} onToggle={toggleSort} />
                  <th>Versao</th>
                  <SortableHeader column="created_at" label="Criado em" sort={params.sort} order={params.order} onToggle={toggleSort} />
                  <th className="text-end">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={toText(row.id)}>
                    <td>{toText(row.id)}</td>
                    <td>{toText(row.title)}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{toText(row.system_version)}</td>
                    <td>{formatDateTime(row.created_at)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link className="btn btn-outline-secondary" to={paths.v1.nav.view(row.id as string | number)}>
                          Ver
                        </Link>
                        <Link className="btn btn-outline-primary" to={paths.v1.menu.listByNav(row.id as string | number)}>
                          Itens
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
        title="Excluir nav"
        message={`Tem certeza que deseja excluir o nav "${toText(pendingDelete?.title, '')}"? (exclusao reversivel — os itens de menu vinculados nao sao afetados)`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
