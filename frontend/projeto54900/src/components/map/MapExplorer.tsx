/**
 * =========================================================================
 * FILE HEADER — components/map/MapExplorer.tsx
 * =========================================================================
 *
 * PROPOSITO: tela de trabalho do mapa, dirigida por props e sem useParams.
 * Escolhe um mapa (map_manager), mostra os pontos dele e oferece tres
 * ferramentas ao lado: buscar endereco, consultar CEP e planejar/gravar trajeto
 * (clique no mapa adiciona paradas).
 *
 *   <MapExplorer />                    // usuario escolhe o mapa
 *   <MapExplorer initialMapId={3} />   // abre ja num mapa
 *
 * DADOS: map-manager (centro, zoom, tiles), view_map_points (filtro exato
 * pt_map_manager_id) e o proxy map-geo. O mapa e remontado ao trocar de
 * `map_manager` (o centro inicial do Leaflet so vale na criacao).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import AddressSearch from '@/components/map/AddressSearch';
import CepSearch from '@/components/map/CepSearch';
import MapView from '@/components/map/MapView';
import RoutePlanner from '@/components/map/RoutePlanner';
import type { PlannerStop } from '@/components/map/RoutePlanner';
import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { useToast } from '@/hooks/useToast';
import { mapManagerTable, mapPointsView } from '@/services/v1';
import type { PaginationInput } from '@/types/api';
import type { GeoAddress, GeoRouteResult, LatLng, MapManagerRow, MapMarker, MapPolyline, PostalCodeRow, RouteProfile } from '@/types/map';
import { toCoord } from '@/types/map';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { LINK_COLORS, LINK_ICONS, errorText, safeColor, safeIcon } from '@/utils/mapLinks';
import type { ApiRow } from '@/types/api';

type Tool = 'address' | 'cep' | 'route';

const MAP_MANAGER_SRC = '/api/v1/map-manager-view/get-no-pagination?sort=title&order=ASC&limit=1000';

const TOOLS: readonly { id: Tool; label: string; icon: string }[] = [
  { id: 'address', label: 'Endereço', icon: 'bi-search' },
  { id: 'cep', label: 'CEP', icon: 'bi-mailbox2' },
  { id: 'route', label: 'Trajeto', icon: 'bi-signpost-split' },
];

export interface MapExplorerProps {
  initialMapId?: number | string | undefined;
}

function newId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

export default function MapExplorer({ initialMapId }: MapExplorerProps) {
  const toast = useToast();

  const [mapId, setMapId] = useState(initialMapId !== undefined ? String(initialMapId) : '');
  const [manager, setManager] = useState<MapManagerRow | null>(null);
  const [points, setPoints] = useState<ApiRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tool, setTool] = useState<Tool>('address');
  const [found, setFound] = useState<GeoAddress | null>(null);
  const [postal, setPostal] = useState<PostalCodeRow | null>(null);

  const [profile, setProfile] = useState<RouteProfile>('driving-car');
  const [stops, setStops] = useState<PlannerStop[]>([]);
  const [routeResult, setRouteResult] = useState<GeoRouteResult | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (mapId === '') {
      setManager(null);
      setPoints([]);
      return;
    }

    const controller = new AbortController();
    setLoadError(null);

    const params: PaginationInput = {
      'filters[pt_map_manager_id]': mapId,
      'filters[pt_status]': 'active',
      limit: 500,
      sort: 'pt_name',
      order: 'ASC',
    };

    Promise.all([
      mapManagerTable.get(mapId, { signal: controller.signal }),
      mapPointsView.search('', params, { signal: controller.signal }),
    ])
      .then(([managerPayload, pointsPayload]) => {
        setManager(normalizeItem<MapManagerRow>(managerPayload));
        setPoints(normalizeList<ApiRow>(pointsPayload).rows);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorText(e));
      });

    return () => controller.abort();
  }, [mapId, reloadTick]);

  const selectSchema = useMemo<FormGridSchema>(
    () => ({
      rows: [
        {
          fields: [
            {
              type: 'select',
              col: 12,
              label: 'Mapa',
              name: 'explorer_map_manager_id',
              placeholder: 'Escolha o mapa',
              src: MAP_MANAGER_SRC,
              valueKey: 'id',
              labelTemplate: '{title}',
              value: mapId,
              onChange: (value: string) => {
                setMapId(value);
                setStops([]);
                setRouteResult(null);
              },
            },
          ],
        },
      ],
    }),
    [mapId],
  );

  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];

    points.forEach((p) => {
      const lat = toCoord(p.pt_lat);
      const lng = toCoord(p.pt_lng);
      if (lat === null || lng === null) return;
      out.push({
        id: `point-${String(p.id)}`,
        position: { lat, lng },
        title: str(p.pt_name) ?? 'Ponto',
        description: [str(p.mc_name), str(p.ma_street)].filter(Boolean).join('\n'),
        icon: safeIcon(str(p.mi_icon_class), LINK_ICONS.point),
        color: safeColor(str(p.mc_color), LINK_COLORS.point),
      });
    });

    if (tool === 'address' && found) {
      out.push({
        id: 'found-address',
        position: { lat: found.lat, lng: found.lng },
        title: found.display_name,
        icon: LINK_ICONS.address,
        color: '#dc3545',
      });
    }

    if (tool === 'cep' && postal) {
      const lat = toCoord(postal.lat);
      const lng = toCoord(postal.lng);
      if (lat !== null && lng !== null) {
        out.push({
          id: 'found-cep',
          position: { lat, lng },
          title: `CEP ${postal.cep}`,
          description: [postal.street, postal.city].filter(Boolean).join('\n'),
          icon: LINK_ICONS.postal_code,
          color: '#dc3545',
        });
      }
    }

    if (tool === 'route') {
      stops.forEach((s, i) =>
        out.push({
          id: s.id,
          position: s.position,
          title: `${i + 1}. ${s.label}`,
          icon: 'bi-geo-fill',
          color: i === 0 ? '#198754' : i === stops.length - 1 ? '#dc3545' : LINK_COLORS.route,
        }),
      );
    }

    return out;
  }, [points, tool, found, postal, stops]);

  const lines = useMemo<MapPolyline[]>(
    () =>
      tool === 'route' && routeResult
        ? [{ id: 'explorer-route', coordinates: routeResult.geometry.coordinates, color: LINK_COLORS.route }]
        : [],
    [tool, routeResult],
  );

  const addStop = useCallback((position: LatLng, label?: string) => {
    setStops((prev) => [...prev, { id: newId(), label: label ?? `Parada ${prev.length + 1}`, position }]);
    setTool('route');
  }, []);

  const centerOfManager: LatLng | undefined = useMemo(() => {
    if (!manager) return undefined;
    const lat = toCoord(manager.center_lat);
    const lng = toCoord(manager.center_lng);
    return lat !== null && lng !== null ? { lat, lng } : undefined;
  }, [manager]);

  const postalCoord: LatLng | null = postal
    ? (() => {
        const lat = toCoord(postal.lat);
        const lng = toCoord(postal.lng);
        return lat !== null && lng !== null ? { lat, lng } : null;
      })()
    : null;

  return (
    <div className="row g-3">
      <div className="col-lg-4">
        <FormGrid schema={selectSchema} />
        {loadError && (
          <div className="alert alert-danger py-2" role="alert">
            {loadError}
          </div>
        )}

        <ul className="nav nav-pills my-3" role="tablist">
          {TOOLS.map((t) => (
            <li className="nav-item" role="presentation" key={t.id}>
              <button
                type="button"
                role="tab"
                aria-selected={tool === t.id}
                className={`nav-link ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
              >
                <i className={`bi ${t.icon} me-1`} aria-hidden="true" />
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {tool === 'address' && (
          <>
            <AddressSearch onSelect={setFound} />
            {found && (
              <div className="card card-body py-2 mt-3">
                <div className="small">{found.display_name}</div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mt-2 align-self-start"
                  onClick={() => addStop({ lat: found.lat, lng: found.lng }, found.display_name.split(',')[0]?.trim())}
                >
                  <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                  Adicionar como parada do trajeto
                </button>
              </div>
            )}
          </>
        )}

        {tool === 'cep' && (
          <>
            <CepSearch onResolved={setPostal} />
            {postalCoord && postal && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={() => addStop(postalCoord, `CEP ${postal.cep}`)}
              >
                <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                Adicionar como parada do trajeto
              </button>
            )}
          </>
        )}

        {tool === 'route' && (
          <RoutePlanner
            stops={stops}
            onStopsChange={setStops}
            profile={profile}
            onProfileChange={setProfile}
            onCalculated={setRouteResult}
            mapManagerId={mapId === '' ? undefined : mapId}
            defaultName="Novo trajeto"
            onSaved={(routeId) => {
              toast.success(`Trajeto gravado (#${routeId}).`);
              setReloadTick((n) => n + 1);
            }}
          />
        )}
      </div>

      <div className="col-lg-8">
        <MapView
          // Remonta quando o mapa escolhido E o registro dele (centro/zoom) ja chegaram: o centro inicial do Leaflet so vale na criacao.
          key={`${mapId || 'sem-mapa'}-${manager ? String(manager.id) : 'carregando'}`}
          height={600}
          markers={markers}
          routes={lines}
          center={centerOfManager}
          zoom={manager ? Number(manager.zoom) || 12 : undefined}
          tileUrl={str(manager?.tile_url)}
          attribution={str(manager?.attribution)}
          {...(tool === 'route' ? { onMapClick: (position: LatLng) => addStop(position) } : {})}
        />
        <div className="small text-body-secondary mt-1">
          {tool === 'route' ? 'Clique no mapa para adicionar paradas ao trajeto.' : `${points.length} ponto(s) neste mapa.`}
        </div>
      </div>
    </div>
  );
}
