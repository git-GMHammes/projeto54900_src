/**
 * =========================================================================
 * FILE HEADER — types/map.ts
 * =========================================================================
 *
 * PROPOSITO: tipos do modulo Map (backend Map/*, 10 tabelas + proxy map-geo).
 * As linhas das views chegam com prefixo de origem (ml_, pt_, ad_ ...), como em
 * app/markdown/geral/README_modulo_map.md; so as colunas que o frontend usa
 * estao tipadas, o resto continua acessivel como `ApiRow`.
 *
 * Valores DECIMAL/BIGINT chegam do MySQL como string: use `toCoord()` para lat/lng.
 * -------------------------------------------------------------------------
 */

import type { ApiRow } from '@/types/api';

/** Tipos de destino de um vinculo (map_links.link_type). */
export type MapLinkType = 'postal_code' | 'address' | 'point' | 'route';

/** Perfis de deslocamento do OpenRouteService (map_routes.profile). */
export type RouteProfile = 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';

export const ROUTE_PROFILES: readonly { value: RouteProfile; label: string; icon: string }[] = [
  { value: 'driving-car', label: 'Carro', icon: 'bi-car-front' },
  { value: 'driving-hgv', label: 'Caminhão', icon: 'bi-truck' },
  { value: 'cycling-regular', label: 'Bicicleta', icon: 'bi-bicycle' },
  { value: 'foot-walking', label: 'A pé', icon: 'bi-person-walking' },
];

/** Coordenada simples. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Converte lat/lng vindos da API (string DECIMAL, number ou null) em numero, ou null se invalido. */
export function toCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Proxy map-geo
// ---------------------------------------------------------------------------

/** Endereco normalizado (casa com as colunas de map_addresses). */
export interface GeoAddress {
  lat: number;
  lng: number;
  display_name: string;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  country: string;
  osm_type: string | null;
  osm_id: number | null;
  geocode_source: 'nominatim';
  geocode_precision: 'rooftop' | 'street' | 'postal_code' | 'city' | 'approximate';
}

export interface GeoSearchResult {
  items: GeoAddress[];
  count: number;
  cached: boolean;
}

/** Linha de map_postal_codes devolvida por map-geo/cep (lat/lng podem vir como string). */
export interface PostalCodeRow extends ApiRow {
  id: number | string;
  cep: string;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  lat: string | number | null;
  lng: string | number | null;
}

export interface GeoCepResult {
  item: PostalCodeRow;
  cached: boolean;
}

export interface GeoStatus {
  nominatim: { configured: boolean; url: string; contact: boolean };
  openrouteservice: { configured: boolean; url: string };
  cep: { viacep: string; brasilapi: string };
  default_country: string;
  user_limit_per_min: number;
  max_route_points: number;
}

/** GeoJSON LineString devolvido pelo OpenRouteService. */
export interface GeoLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RouteLeg {
  distance_m: number;
  duration_s: number;
}

export interface GeoRouteRequest {
  profile?: RouteProfile;
  /** Pontos [lng, lat] ou {lat, lng}; de 2 a 50. */
  coordinates: ([number, number] | LatLng)[];
  save?: { map_manager_id: number; name: string };
  stops?: { label?: string; map_point_id?: number; map_address_id?: number }[];
}

export interface GeoRouteResult {
  profile: RouteProfile;
  provider: string;
  distance_m: number;
  duration_s: number;
  legs: RouteLeg[];
  geometry: GeoLineString;
  bbox: number[] | null;
  cached: boolean;
  saved?: { route_id: number; stop_ids: number[] };
}

// ---------------------------------------------------------------------------
// Linhas das tabelas / views
// ---------------------------------------------------------------------------

export interface MapManagerRow extends ApiRow {
  id: number | string;
  slug: string;
  title: string;
  center_lat: string | number;
  center_lng: string | number;
  zoom: number | string;
  tile_url: string;
  attribution: string;
}

/** Linha de view_map_links: o vinculo com o destino ja resolvido. */
export interface MapLinkViewRow extends ApiRow {
  id: number | string;
  ml_module: string;
  ml_reference_id: number | string;
  ml_collection: string;
  ml_link_type: MapLinkType;
  ml_map_postal_code_id: number | string | null;
  ml_map_address_id: number | string | null;
  ml_map_point_id: number | string | null;
  ml_map_route_id: number | string | null;
  ml_label: string | null;
  ml_sort_order: number | string;
  ml_user_manager_id: number | string | null;
  target_lat: string | number | null;
  target_lng: string | number | null;
  pc_cep: string | null;
  pc_street: string | null;
  pc_city: string | null;
  pc_state: string | null;
  ad_cep: string | null;
  ad_street: string | null;
  ad_number: string | null;
  ad_city: string | null;
  ad_state: string | null;
  ad_display_name: string | null;
  pt_name: string | null;
  pt_icon_class: string | null;
  pt_color: string | null;
  pt_size_w: number | string | null;
  pt_size_h: number | string | null;
  pt_anchor_x: number | string | null;
  pt_anchor_y: number | string | null;
  pt_upload_id: number | string | null;
  rt_name: string | null;
  rt_profile: RouteProfile | null;
  rt_distance_m: number | string | null;
  rt_duration_s: number | string | null;
  /** String JSON do GeoJSON LineString (coluna LONGTEXT). */
  rt_geometry: string | null;
}

/** Marcador desenhado pelo MapView. */
export interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
  /** Texto do popup (varias linhas por \n). */
  description?: string;
  /** Classe do Bootstrap Icons, ex.: 'bi-geo-alt-fill'. */
  icon?: string;
  color?: string;
  /** Imagem/SVG do icone (blob: URL de um upload); tem prioridade sobre `icon`. */
  imageUrl?: string;
  /** Tamanho e ancora do icone em px (map_icons). Padrao: 32x32, ancora 16,32. */
  width?: number | undefined;
  height?: number | undefined;
  anchorX?: number;
  anchorY?: number;
}

/** Circulo desenhado pelo MapView (ex.: raio de precisao de uma localizacao, em metros). */
export interface MapCircle {
  id: string;
  position: LatLng;
  radiusM: number;
  color?: string;
}

/** Linha (trajeto) desenhada pelo MapView. */
export interface MapPolyline {
  id: string;
  /** Pares [lng, lat] como no GeoJSON. */
  coordinates: [number, number][];
  color?: string;
  title?: string;
}

/** Texto de duracao: 3725 -> "1 h 02 min". */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m > 0) return `${m} min`;
  return `${total} s`;
}

/** Texto de distancia: 5120 -> "5,1 km"; 800 -> "800 m". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}
