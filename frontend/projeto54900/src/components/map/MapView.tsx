/**
 * =========================================================================
 * FILE HEADER — components/map/MapView.tsx
 * =========================================================================
 *
 * PROPOSITO: mapa Leaflet (react-leaflet) reutilizavel e dirigido por props:
 * tiles do OpenStreetMap, marcadores e linhas (trajetos). Nao conhece rota nem
 * modulo — quem chama passa os dados. Usado por MapLinksPanel, MapLinkPicker e
 * pelas paginas de pages/v1/map.
 *
 *   <MapView markers={[...]} routes={[...]} height={360} onMapClick={setPos} />
 *
 * PROPS: `center`/`zoom` (inicial), `markers`, `routes` (coordenadas [lng, lat]
 * como no GeoJSON), `fitToContent` (enquadra marcadores e linhas; padrao true),
 * `tileUrl`/`attribution` (padrao: OSM — manter a atribuicao), `onMapClick`.
 *
 * MARCADORES: `L.divIcon` com Bootstrap Icons (classe `bi-...` + cor), porque os
 * icones PNG padrao do Leaflet quebram no bundle do Vite. Icone e cor passam por
 * safeIcon/safeColor (valores vem do banco e entram em HTML).
 *
 * CSS: o import de 'leaflet/dist/leaflet.css' fica AQUI (carrega junto do chunk
 * lazy do mapa); a regra "Bootstrap so em bootstrap.ts" vale para o Bootstrap.
 *
 * ARMADILHAS: o mapa dentro de modal/aba nasce com tamanho 0 — o ResizeObserver
 * chama invalidateSize(). `center`/`zoom` de MapContainer so valem na criacao;
 * o enquadramento posterior e do FitToContent.
 * -------------------------------------------------------------------------
 */

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import type { LatLng, MapCircle, MapMarker, MapPolyline } from '@/types/map';
import { safeColor, safeIcon } from '@/utils/mapLinks';

const DEFAULT_CENTER: LatLng = { lat: -22.9068, lng: -43.1729 };
const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapViewProps {
  center?: LatLng | undefined;
  zoom?: number | undefined;
  /** Altura do mapa (px ou CSS). Padrao: 360. */
  height?: number | string | undefined;
  markers?: MapMarker[] | undefined;
  routes?: MapPolyline[] | undefined;
  /** Circulos (ex.: raio de precisao de uma localizacao). Nao entram no enquadramento. */
  circles?: MapCircle[] | undefined;
  /** Enquadra marcadores e linhas ao mudarem. Padrao: true. */
  fitToContent?: boolean | undefined;
  tileUrl?: string | undefined;
  attribution?: string | undefined;
  minZoom?: number | undefined;
  maxZoom?: number | undefined;
  /** Clique no mapa (para escolher um ponto). */
  onMapClick?: ((position: LatLng) => void) | undefined;
  className?: string | undefined;
}

function buildIcon(icon: string | undefined, color: string | undefined): L.DivIcon {
  const cls = safeIcon(icon);
  const col = safeColor(color);

  return L.divIcon({
    className: 'map-marker',
    html: `<i class="bi ${cls}" style="color:${col};font-size:32px;line-height:32px;text-shadow:0 1px 2px rgba(0,0,0,.45)"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

/** Enquadra marcadores e linhas; muda so quando o conteudo muda de verdade. */
function FitToContent({ markers, routes, enabled }: { markers: MapMarker[]; routes: MapPolyline[]; enabled: boolean }) {
  const map = useMap();

  const pointsKey = useMemo(() => {
    const points: LatLngTuple[] = [];
    markers.forEach((m) => points.push([m.position.lat, m.position.lng]));
    routes.forEach((r) => r.coordinates.forEach(([lng, lat]) => points.push([lat, lng])));
    return JSON.stringify(points);
  }, [markers, routes]);

  useEffect(() => {
    if (!enabled) return;

    const points = JSON.parse(pointsKey) as LatLngTuple[];
    const first = points[0];
    if (first === undefined) return;

    if (points.length === 1) {
      map.setView(first, Math.max(map.getZoom(), 15));
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 16 });
  }, [map, pointsKey, enabled]);

  return null;
}

/** Recalcula o tamanho quando o container muda (modal, aba, offcanvas). */
function SizeWatcher() {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function ClickCatcher({ onClick }: { onClick: (position: LatLng) => void }) {
  useMapEvents({
    click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });

  return null;
}

export default function MapView({
  center,
  zoom,
  height = 360,
  markers = [],
  routes = [],
  circles = [],
  fitToContent = true,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  minZoom,
  maxZoom,
  onMapClick,
  className,
}: MapViewProps) {
  const start = center ?? DEFAULT_CENTER;
  const icons = useMemo(
    () => new Map(markers.map((m) => [m.id, buildIcon(m.icon, m.color)] as const)),
    [markers],
  );

  return (
    <div className={`rounded border overflow-hidden ${className ?? ''}`} style={{ height }}>
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={zoom ?? 11}
        minZoom={minZoom}
        maxZoom={maxZoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <SizeWatcher />
        <FitToContent markers={markers} routes={routes} enabled={fitToContent} />
        {onMapClick && <ClickCatcher onClick={onMapClick} />}

        {circles.map((c) => (
          <Circle
            key={c.id}
            center={[c.position.lat, c.position.lng]}
            radius={c.radiusM}
            pathOptions={{ color: safeColor(c.color, '#0d6efd'), weight: 1, fillOpacity: 0.15 }}
          />
        ))}

        {routes.map((r) => (
          <Polyline
            key={r.id}
            positions={r.coordinates.map(([lng, lat]): LatLngTuple => [lat, lng])}
            pathOptions={{ color: safeColor(r.color, '#6f42c1'), weight: 5, opacity: 0.85 }}
          >
            {r.title && <Popup>{r.title}</Popup>}
          </Polyline>
        ))}

        {markers.map((m) => (
          <Marker key={m.id} position={[m.position.lat, m.position.lng]} icon={icons.get(m.id)}>
            {(m.title || m.description) && (
              <Popup>
                {m.title && <strong>{m.title}</strong>}
                {m.description?.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
