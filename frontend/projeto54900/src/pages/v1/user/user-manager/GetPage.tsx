// Detalhe de um usuario — api/v1/user-manager-view/get/{id}

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { userManagerView } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
import { formatDateTime, toText } from '@/utils/format';

import PageHeader from '@/components/global/PageHeader';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import EmptyState from '@/components/global/EmptyState';

export default function GetPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    userManagerView.get(id ?? '', { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, id]);

  const user = useMemo(() => normalizeItem(data), [data]);

  return (
    <>
      <PageHeader title={`Usuario #${id ?? ''}`} subtitle="api/v1/user-manager-view">
        <Link className="btn btn-outline-secondary" to={paths.v1.user.list}>
          Voltar
        </Link>
        <Link className="btn btn-primary" to={paths.v1.user.update(id ?? '')}>
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

      {!loading && !error && !user && <EmptyState title="Usuario nao encontrado" />}

      {!loading && !error && user && (
        <div className="card">
          <div className="card-body">
            <dl className="row mb-0">
              {Object.entries(user).map(([field, value]) => (
                <div className="col-12 col-sm-6" key={field}>
                  <dt className="text-body-secondary small text-uppercase">{field}</dt>
                  <dd>{field.includes('_at') ? formatDateTime(value) : toText(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
