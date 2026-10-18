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
 * LOCALIZACAO: sem centro no map_manager, abre na posicao do navegador (useGeolocation);
 * negada/indisponivel, abre no Estado do RJ e a busca de endereco prioriza o Sudeste
 * (utils/mapRegion.ts).
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
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/useToast';
import { mapManagerTable, mapPointsView, mapRoutesView, mapRouteStopsView, uploadManagerUpload } from '@/services/v1';
import type { PaginationInput } from '@/types/api';
import type { GeoAddress, GeoRouteResult, LatLng, MapManagerRow, MapMarker, MapPolyline, PostalCodeRow, RouteProfile } from '@/types/map';
import { formatDistance, formatDuration, toCoord } from '@/types/map';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { FALLBACK_CENTER, FALLBACK_ZOOM, GPS_ZOOM, searchViewbox } from '@/utils/mapRegion';
import { LINK_COLORS, LINK_ICONS, PROFILE_COLORS, errorText, parseLineString, safeColor, safeIcon } from '@/utils/mapLinks';
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

function txt(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function num(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export default function MapExplorer({ initialMapId }: MapExplorerProps) {
  const toast = useToast();
  const geo = useGeolocation();
  const requestGeo = geo.request;

  useEffect(() => {
    requestGeo();
  }, [requestGeo]);

  const [mapId, setMapId] = useState(initialMapId !== undefined ? String(initialMapId) : '');
  const [manager, setManager] = useState<MapManagerRow | null>(null);
  const [points, setPoints] = useState<ApiRow[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<ApiRow[]>([]);
  const [savedStops, setSavedStops] = useState<ApiRow[]>([]);
  // upload_id do icone -> blob: URL (a rota serve exige token, nao serve em <img src>).
  const [iconImages, setIconImages] = useState<Record<string, string>>({});
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
      setSavedRoutes([]);
      setSavedStops([]);
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

    const routeParams: PaginationInput = {
      'filters[mr_map_manager_id]': mapId,
      'filters[mr_status]': 'active',
      limit: 200,
      sort: 'id',
      order: 'ASC',
    };

    Promise.all([
      mapManagerTable.get(mapId, { signal: controller.signal }),
      mapPointsView.search('', params, { signal: controller.signal }),
      mapRoutesView.search('', routeParams, { signal: controller.signal }),
    ])
      .then(async ([managerPayload, pointsPayload, routesPayload]) => {
        const routeRows = normalizeList<ApiRow>(routesPayload).rows;
        const stopPayloads = await Promise.all(
          routeRows.map((r) =>
            mapRouteStopsView.search(
              '',
              { 'filters[rs_map_route_id]': String(r.id), limit: 200, sort: 'rs_sort_order', order: 'ASC' },
              { signal: controller.signal },
            ),
          ),
        );
        setManager(normalizeItem<MapManagerRow>(managerPayload));
        setPoints(normalizeList<ApiRow>(pointsPayload).rows);
        setSavedRoutes(routeRows);
        setSavedStops(stopPayloads.flatMap((p) => normalizeList<ApiRow>(p).rows));
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorText(e));
      });

    return () => controller.abort();
  }, [mapId, reloadTick]);

  // Icones de pontos do tipo imagem/SVG: baixa cada anexo uma vez e guarda o blob: URL.
  useEffect(() => {
    const wanted = [...new Set(points.map((p) => txt(p.mi_upload_id)).filter((id) => id !== '' && id !== 'null'))]
      .filter((id) => !(id in iconImages));
    if (wanted.length === 0) return;

    let alive = true;
    wanted.forEach((id) => {
      uploadManagerUpload
        .fetchBlob(id)
        .then((blob) => {
          if (alive) setIconImages((prev) => ({ ...prev, [id]: URL.createObjectURL(blob) }));
        })
        .catch(() => {
          if (alive) setIconImages((prev) => ({ ...prev, [id]: '' }));
        });
    });
    return () => {
      alive = false;
    };
  }, [points, iconImages]);

  useEffect(
    () => () => {
      Object.values(iconImages).forEach((url) => url && URL.revokeObjectURL(url));
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

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

  const centerOfManager: LatLng | undefined = useMemo(() => {
    if (!manager) return undefined;
    const lat = toCoord(manager.center_lat);
    const lng = toCoord(manager.center_lng);
    return lat !== null && lng !== null ? { lat, lng } : undefined;
  }, [manager]);

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
        description: [
          str(p.pt_description),
          str(p.mc_name) ? `Categoria: ${String(p.mc_name)}` : undefined,
          [str(p.ma_street), str(p.ma_number), str(p.ma_city)].filter(Boolean).join(', ') || undefined,
        ]
          .filter(Boolean)
          .join('\n'),
        icon: safeIcon(str(p.mi_icon_class), LINK_ICONS.point),
        // Cor: a do icone; sem ela, a da categoria; sem ela, a padrao do ponto.
        color: safeColor(str(p.mi_color) ?? str(p.mc_color), LINK_COLORS.point),
        ...(iconImages[String(p.mi_upload_id)] ? { imageUrl: iconImages[String(p.mi_upload_id)] } : {}),
        ...(num(p.mi_size_w) ? { width: num(p.mi_size_w) } : {}),
        ...(num(p.mi_size_h) ? { height: num(p.mi_size_h) } : {}),
        ...(p.mi_anchor_x != null && Number.isFinite(Number(p.mi_anchor_x)) ? { anchorX: Number(p.mi_anchor_x) } : {}),
        ...(p.mi_anchor_y != null && Number.isFinite(Number(p.mi_anchor_y)) ? { anchorY: Number(p.mi_anchor_y) } : {}),
      });
    });

    // Paradas dos trajetos salvos (numeradas na ordem do trajeto).
    savedStops.forEach((st) => {
      const lat = toCoord(st.rs_lat);
      const lng = toCoord(st.rs_lng);
      if (lat === null || lng === null) return;
      out.push({
        id: `saved-stop-${String(st.id)}`,
        position: { lat, lng },
        title: `${txt(st.rs_sort_order)}. ${str(st.rs_label) ?? str(st.pt_name) ?? 'Parada'}`,
        description: [str(st.mr_name), str(st.ma_display_name)].filter(Boolean).join('\n'),
        icon: 'bi-geo-fill',
        color: PROFILE_COLORS[String(savedRoutes.find((r) => r.id === st.rs_map_route_id)?.mr_profile)] ?? LINK_COLORS.route,
      });
    });

    if (geo.fix && !centerOfManager) {
      out.push({
        id: 'me',
        position: { lat: geo.fix.lat, lng: geo.fix.lng },
        title: 'Você está aqui',
        icon: 'bi-person-fill',
        color: '#0d6efd',
      });
    }

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
  }, [points, savedStops, savedRoutes, iconImages, tool, found, postal, stops, geo.fix, centerOfManager]);

  const lines = useMemo<MapPolyline[]>(() => {
    // Trajetos gravados no mapa (sempre visiveis) + o que esta sendo calculado.
    const out: MapPolyline[] = [];
    savedRoutes.forEach((r) => {
      const coordinates = parseLineString(str(r.mr_geometry));
      if (coordinates === null) return;
      out.push({
        id: `saved-route-${String(r.id)}`,
        coordinates,
        color: PROFILE_COLORS[String(r.mr_profile)] ?? LINK_COLORS.route,
        title: [
          str(r.mr_name),
          num(r.mr_distance_m) ? formatDistance(Number(r.mr_distance_m)) : undefined,
          num(r.mr_duration_s) ? formatDuration(Number(r.mr_duration_s)) : undefined,
        ]
          .filter(Boolean)
          .join(' · '),
      });
    });
    if (tool === 'route' && routeResult) {
      out.push({ id: 'explorer-route', coordinates: routeResult.geometry.coordinates, color: LINK_COLORS.route });
    }
    return out;
  }, [tool, routeResult, savedRoutes]);

  const addStop = useCallback((position: LatLng, label?: string) => {
    setStops((prev) => [...prev, { id: newId(), label: label ?? `Parada ${prev.length + 1}`, position }]);
    setTool('route');
  }, []);

  const gpsCenter: LatLng | undefined = geo.fix ? { lat: geo.fix.lat, lng: geo.fix.lng } : undefined;
  const viewbox = useMemo(() => searchViewbox(gpsCenter), [gpsCenter?.lat, gpsCenter?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <AddressSearch onSelect={setFound} viewbox={viewbox} origin={gpsCenter} />
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
            viewbox={viewbox}
            origin={gpsCenter}
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
          key={`${mapId || 'sem-mapa'}-${manager ? String(manager.id) : 'carregando'}-${geo.fix ? 'gps' : 'sem-gps'}`}
          height={600}
          markers={markers}
          routes={lines}
          center={centerOfManager ?? gpsCenter ?? FALLBACK_CENTER}
          zoom={manager && centerOfManager ? Number(manager.zoom) || 12 : gpsCenter ? GPS_ZOOM : FALLBACK_ZOOM}
          tileUrl={str(manager?.tile_url)}
          attribution={str(manager?.attribution)}
          {...(tool === 'route' ? { onMapClick: (position: LatLng) => addStop(position) } : {})}
        />
        <div className="small text-body-secondary mt-1">
          {tool === 'route' ? 'Clique no mapa para adicionar paradas ao trajeto.' : `${points.length} ponto(s) e ${savedRoutes.length} trajeto(s) neste mapa.`}
        </div>
      </div>
    </div>
  );
}
