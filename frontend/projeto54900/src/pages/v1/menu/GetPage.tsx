// Detalhe de um item de menu — api/v1/menu-manager/get/{id}

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
import { parseStringList } from '@/utils/jsonList';
import { formatDateTime, toText } from '@/utils/format';

import PageHeader from '@/components/global/PageHeader';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import EmptyState from '@/components/global/EmptyState';

export default function GetPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    menuManagerTable.get(id ?? '', { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, id]);

  const item = useMemo(() => normalizeItem(data), [data]);
  const navManagerId = item ? toText((item as Record<string, unknown>).nav_manager_id, '') : '';

  return (
    <>
      <PageHeader title={`Item de menu #${id ?? ''}`} subtitle="api/v1/menu-manager">
        <Link
          className="btn btn-outline-secondary"
          to={navManagerId ? paths.v1.menu.listByNav(navManagerId) : paths.v1.menu.list}
        >
          Voltar
        </Link>
        <Link className="btn btn-primary" to={paths.v1.menu.update(id ?? '')}>
          Editar
        </Link>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {!loading && error && (
        <EmptyState variant="danger" title="Falha ao carregar" description={error.message}>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void run()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {!loading && !error && !item && <EmptyState title="Item nao encontrado" />}

      {!loading && !error && item && (
        <div className="card">
          <div className="card-body">
            <dl className="row mb-0">
              {Object.entries(item).map(([field, value]) => {
                let shown = toText(value);
                if (field.includes('_at')) shown = formatDateTime(value);
                else if (field === 'roles') shown = parseStringList(toText(value, '')).join(', ') || '-';
                return (
                  <div className="col-12 col-sm-6" key={field}>
                    <dt className="text-body-secondary small text-uppercase">{field}</dt>
                    <dd className="text-break">{shown}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
