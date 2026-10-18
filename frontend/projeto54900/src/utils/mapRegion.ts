/**
 * =========================================================================
 * FILE HEADER — utils/mapRegion.ts
 * =========================================================================
 *
 * PROPOSITO: regiao padrao do mapa quando nao ha localizacao do navegador:
 * centro no Estado do Rio de Janeiro e caixa de busca no Sudeste do Brasil.
 * Com localizacao, a caixa de busca e centrada no usuario.
 *
 *   searchViewbox(fix)   // "left,top,right,bottom" (lng,lat) para o Nominatim
 * -------------------------------------------------------------------------
 */

import type { LatLng } from '@/types/map';

/** Centro aproximado do Estado do Rio de Janeiro. */
export const FALLBACK_CENTER: LatLng = { lat: -22.25, lng: -42.7 };
export const FALLBACK_ZOOM = 8;
export const GPS_ZOOM = 14;

/** Sudeste do Brasil (SP, RJ, MG, ES): left,top,right,bottom. */
const SOUTHEAST_VIEWBOX = '-53.2,-14.2,-39.6,-25.4';

/** 2,25 graus (~250 km) ao redor do usuario. */
const GPS_RADIUS_DEG = 2.25;

export function searchViewbox(fix?: LatLng | null): string {
  if (!fix) return SOUTHEAST_VIEWBOX;

  const left = (fix.lng - GPS_RADIUS_DEG).toFixed(4);
  const top = (fix.lat + GPS_RADIUS_DEG).toFixed(4);
  const right = (fix.lng + GPS_RADIUS_DEG).toFixed(4);
  const bottom = (fix.lat - GPS_RADIUS_DEG).toFixed(4);
  return `${left},${top},${right},${bottom}`;
}

/** Distancia em linha reta (km) entre dois pontos — formula de haversine. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
