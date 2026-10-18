// Visualizacao de um local (view_location_manager): dados, caminho na arvore, filhos diretos e
// o mapa do registro (MapLinksPanel, modulo 'location-manager' em Config/MapLinkables.php).
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import PageHeader from '@/components/global/PageHeader';
import MapLinksPanel from '@/components/map/MapLinksPanel';
import { useGoBack } from '@/hooks/useGoBack';
import { paths } from '@/routes/paths';
import { ApiError } from '@/services/http';
import { locationManagerView } from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';
import { toCoord } from '@/types/map';
import type { ApiRow } from '@/types/api';

export default function GetPage() {
  const { id = '' } = useParams();
  const goBack = useGoBack(paths.v1.locationManager.list);
  const [row, setRow] = useState<ApiRow | null>(null);
  const [children, setChildren] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      locationManagerView.get(id),
      locationManagerView.find({ parent_id: id }),
    ])
      .then(([one, kids]) => {
        if (!alive) return;
        setRow(normalizeItem(one));
        setChildren(normalizeList(kids).rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof ApiError ? err.message : 'Falha ao carregar o local.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // Ponto proprio do local (latitude/longitude do cadastro): e o mapa padrao da tela.
  const lat = toCoord(row?.latitude);
  const lng = toCoord(row?.longitude);
  const basePoint = lat !== null && lng !== null ? { lat, lng, title: toText(row?.name, ''), zoom: 18 } : undefined;

  const fields: [string, string][] = row
    ? [
        ['Tipo', toText(row.type_name, '')],
        ['Código', toText(row.code, '')],
        ['Caminho', toText(row.path_names, '')],
        ['Nível', toText(row.depth, '')],
        ['Latitude', toText(row.latitude, '')],
        ['Longitude', toText(row.longitude, '')],
        ['Status', toText(row.status, '') === 'inactive' ? 'Inativo' : 'Ativo'],
        ['Descrição', toText(row.description, '')],
      ]
    : [];

  return (
    <div className="container py-3">
      <PageHeader title={row ? toText(row.name, '') : `Local #${id}`} subtitle="Dados do local e seus vínculos no mapa.">
        <button type="button" className="btn btn-outline-secondary me-2" onClick={goBack}>
          Voltar
        </button>
        <Link className="btn btn-primary" to={paths.v1.locationManager.update(id)}>
          Editar
        </Link>
      </PageHeader>
      {loading ? <LoadingOverlay /> : null}
      {error ? <EmptyState variant="danger" title="Erro ao carregar" description={error} /> : null}
      {row ? (
        <>
          <dl className="row">
            {fields.map(([label, value]) => (
              <div className="col-md-6 mb-2" key={label}>
                <dt className="small text-body-secondary">{label}</dt>
                <dd className="mb-0">{value || '—'}</dd>
              </div>
            ))}
          </dl>
          <h2 className="h5 mt-4">Locais dentro deste ({children.length})</h2>
          {children.length === 0 ? (
            <p className="text-body-secondary">Nenhum local filho.</p>
          ) : (
            <ul className="list-group mb-4">
              {children.map((child) => (
                <li className="list-group-item" key={toText(child.id, '')}>
                  <Link to={paths.v1.locationManager.view(toText(child.id, ''))}>{toText(child.name, '')}</Link>
                  <span className="text-body-secondary small ms-2">{toText(child.type_name, '')}</span>
                </li>
              ))}
            </ul>
          )}
          <MapLinksPanel
            module="location-manager"
            referenceId={id}
            basePoint={basePoint}
          />
        </>
      ) : null}
    </div>
  );
}
