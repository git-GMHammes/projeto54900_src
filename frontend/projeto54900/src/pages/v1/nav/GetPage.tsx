// Detalhe de um nav — api/v1/nav-manager/get/{id}

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { navManagerTable } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
import { formatDateTime, toText } from '@/utils/format';

import PageHeader from '@/components/global/PageHeader';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import EmptyState from '@/components/global/EmptyState';

export default function GetPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    navManagerTable.get(id ?? '', { signal }),
  );

  useEffect(() => {
    void run();
  }, [run, id]);

  const item = useMemo(() => normalizeItem(data), [data]);

  return (
    <>
      <PageHeader title={`Nav #${id ?? ''}`} subtitle="api/v1/nav-manager">
        <Link className="btn btn-outline-secondary" to={paths.v1.nav.list}>
          Voltar
        </Link>
        {id && (
          <Link className="btn btn-outline-primary" to={paths.v1.menu.listByNav(id)}>
            Ver itens
          </Link>
        )}
        <Link className="btn btn-primary" to={paths.v1.nav.update(id ?? '')}>
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

      {!loading && !error && !item && <EmptyState title="Nav nao encontrado" />}

      {!loading && !error && item && (
        <div className="card">
          <div className="card-body">
            {Boolean(item.image) && (
              <img
                src={toText(item.image)}
                alt={item.title ? toText(item.title) : 'Imagem do nav'}
                className="img-thumbnail mb-3"
                style={{ maxHeight: 120 }}
              />
            )}
            <dl className="row mb-0">
              {Object.entries(item).map(([field, value]) => (
                <div className="col-12 col-sm-6" key={field}>
                  <dt className="text-body-secondary small text-uppercase">{field}</dt>
                  <dd className="text-break">{field.includes('_at') ? formatDateTime(value) : toText(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
