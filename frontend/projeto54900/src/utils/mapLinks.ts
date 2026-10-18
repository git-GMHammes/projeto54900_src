/**
 * =========================================================================
 * FILE HEADER — utils/mapLinks.ts
 * =========================================================================
 *
 * PROPOSITO: funcoes puras (sem estado React) que transformam uma linha de
 * view_map_links em titulo, subtitulo, icone, marcador e linha do mapa, mais o
 * `errorText` usado pelos componentes de components/map/*.
 *
 * CONSUMIDORES: components/map/MapLinksPanel.tsx, MapLinkPicker.tsx.
 *
 * SEGURANCA: icone e cor vem do banco (map_icons) e entram em HTML do marcador;
 * por isso `safeIcon`/`safeColor` so aceitam o formato esperado (classe
 * `bi-...` e cor hex/nome) e caem no padrao caso contrario.
 * -------------------------------------------------------------------------
 */

import type { MapLinkType, MapLinkViewRow, MapMarker, MapPolyline } from '@/types/map';
import { formatDistance, formatDuration, toCoord } from '@/types/map';

/** Cor do marcador por tipo de vinculo. */
export const LINK_COLORS: Readonly<Record<MapLinkType, string>> = {
  point: '#0d6efd',
  address: '#198754',
  postal_code: '#fd7e14',
  route: '#6f42c1',
};

/** Icone (Bootstrap Icons) por tipo de vinculo. */
export const LINK_ICONS: Readonly<Record<MapLinkType, string>> = {
  point: 'bi-geo-alt-fill',
  address: 'bi-house-door-fill',
  postal_code: 'bi-mailbox2',
  route: 'bi-signpost-split-fill',
};

/** Rotulo em portugues por tipo de vinculo. */
export const LINK_LABELS: Readonly<Record<MapLinkType, string>> = {
  point: 'Ponto no mapa',
  address: 'Endereço',
  postal_code: 'CEP',
  route: 'Rota',
};

/** Mensagem legivel de qualquer erro capturado. */
export function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível concluir a operação.';
}

/** Aceita so classes do Bootstrap Icons (bi-xxx); senao devolve o padrao. */
export function safeIcon(icon: string | null | undefined, fallback = 'bi-geo-alt-fill'): string {
  return icon && /^bi-[a-z0-9-]+$/.test(icon) ? icon : fallback;
}

/** Aceita so cor hex (#rgb, #rrggbb, #rrggbbaa) ou nome simples; senao devolve o padrao. */
export function safeColor(color: string | null | undefined, fallback = '#0d6efd'): string {
  return color && /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20})$/.test(color) ? color : fallback;
}

function text(value: string | null | undefined): string {
  return value ? value : '';
}

function addressLine(row: MapLinkViewRow): string {
  const street = [text(row.ad_street), text(row.ad_number)].filter(Boolean).join(', ');
  const city = [text(row.ad_city), text(row.ad_state)].filter(Boolean).join('/');
  return [street, city].filter(Boolean).join(' — ');
}

/** Titulo do vinculo: rotulo, senao nome do ponto/rota, senao endereco/CEP. */
export function linkTitle(row: MapLinkViewRow): string {
  if (row.ml_label) return row.ml_label;

  switch (row.ml_link_type) {
    case 'point':
      return text(row.pt_name) || 'Ponto sem nome';
    case 'route':
      return text(row.rt_name) || 'Rota sem nome';
    case 'address':
      return text(row.ad_display_name) || addressLine(row) || 'Endereço';
    case 'postal_code':
      return [text(row.pc_cep), text(row.pc_street)].filter(Boolean).join(' — ') || 'CEP';
  }
}

/** Linha de apoio: tipo, papel (collection) e dado principal (coordenada, CEP ou tempo da rota). */
export function linkSubtitle(row: MapLinkViewRow): string {
  const parts: string[] = [LINK_LABELS[row.ml_link_type]];
  if (row.ml_collection && row.ml_collection !== 'default') parts.push(row.ml_collection);

  if (row.ml_link_type === 'route') {
    const distance = toCoord(row.rt_distance_m);
    const duration = toCoord(row.rt_duration_s);
    if (distance !== null) parts.push(formatDistance(distance));
    if (duration !== null) parts.push(formatDuration(duration));
  } else {
    const lat = toCoord(row.target_lat);
    const lng = toCoord(row.target_lng);
    if (lat !== null && lng !== null) parts.push(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }

  return parts.join(' · ');
}

function positive(value: unknown): number | undefined {
  const n = Number(value);
  return value != null && Number.isFinite(n) && n > 0 ? n : undefined;
}

function pointIconSize(row: MapLinkViewRow): Partial<MapMarker> {
  const width = positive(row.pt_size_w);
  const height = positive(row.pt_size_h);
  const ax = row.pt_anchor_x != null && Number.isFinite(Number(row.pt_anchor_x)) ? Number(row.pt_anchor_x) : undefined;
  const ay = row.pt_anchor_y != null && Number.isFinite(Number(row.pt_anchor_y)) ? Number(row.pt_anchor_y) : undefined;
  return {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(ax !== undefined ? { anchorX: ax } : {}),
    ...(ay !== undefined ? { anchorY: ay } : {}),
  };
}

/** Cor do trajeto por perfil de deslocamento. */
export const PROFILE_COLORS: Record<string, string> = {
  'driving-car': '#6f42c1',
  'driving-hgv': '#fd7e14',
  'cycling-regular': '#198754',
  'foot-walking': '#0dcaf0',
};

/** Marcador do vinculo (ponto, endereco ou CEP com coordenada); null para rota ou sem coordenada. */
export function linkToMarker(row: MapLinkViewRow): MapMarker | null {
  if (row.ml_link_type === 'route') return null;

  const lat = toCoord(row.target_lat);
  const lng = toCoord(row.target_lng);
  if (lat === null || lng === null) return null;

  return {
    id: `link-${row.id}`,
    position: { lat, lng },
    title: linkTitle(row),
    description: linkSubtitle(row),
    // Ponto: icone, cor e tamanho do cadastro (icone do ponto ou da categoria).
    icon: row.ml_link_type === 'point' ? safeIcon(row.pt_icon_class, LINK_ICONS.point) : LINK_ICONS[row.ml_link_type],
    color: row.ml_link_type === 'point' ? safeColor(row.pt_color, LINK_COLORS.point) : LINK_COLORS[row.ml_link_type],
    ...(row.ml_link_type === 'point' ? pointIconSize(row) : {}),
  };
}

/** Converte a geometria GeoJSON (string) de uma rota em linha do mapa; null se invalida. */
export function parseLineString(geometry: string | null | undefined): [number, number][] | null {
  if (!geometry) return null;

  try {
    const parsed: unknown = JSON.parse(geometry);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as { type?: unknown; coordinates?: unknown };
    if (record.type !== 'LineString' || !Array.isArray(record.coordinates)) return null;

    const out: [number, number][] = [];
    for (const point of record.coordinates as unknown[]) {
      if (Array.isArray(point) && typeof point[0] === 'number' && typeof point[1] === 'number') {
        out.push([point[0], point[1]]);
      }
    }
    return out.length >= 2 ? out : null;
  } catch {
    return null;
  }
}

/** Linha do mapa para vinculos do tipo rota; null para os demais ou sem geometria. */
export function linkToPolyline(row: MapLinkViewRow): MapPolyline | null {
  if (row.ml_link_type !== 'route') return null;

  const coordinates = parseLineString(row.rt_geometry);
  if (coordinates === null) return null;

  return {
    id: `link-${row.id}`,
    coordinates,
    color: PROFILE_COLORS[String(row.rt_profile)] ?? LINK_COLORS.route,
    title: linkTitle(row),
  };
}
