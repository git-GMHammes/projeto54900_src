/**
 * =========================================================================
 * FILE HEADER — services/v1/mapGeo.ts
 * =========================================================================
 *
 * PROPOSITO: proxy dos provedores de mapa (Nominatim, ViaCEP/BrasilAPI,
 * OpenRouteService). NAO usa createResource (nao e o endpoint-set padrao):
 * 5 rotas proprias. Espelho de app/Config/Routes/Api/v1/Map/MapGeo/EndpointGeo.php,
 * grupo api/v1/map-geo -> Api\V1\Map\MapGeo\GeoController.
 *
 *   status()                 -> GET  map-geo/status
 *   search(q, opts)          -> GET  map-geo/search?q=&limit=&country=&viewbox=
 *   reverse(lat, lng)        -> GET  map-geo/reverse?lat=&lng=
 *   cep(cep, refresh?)       -> GET  map-geo/cep/{cep}
 *   route(body)              -> POST map-geo/route
 *
 * O navegador nunca chama os provedores: o backend aplica cache, limite por
 * usuario e guarda a chave do OpenRouteService. As respostas ja vem no formato
 * das tabelas map_addresses / map_postal_codes / map_routes.
 *
 * DEPENDENCIAS: services/http, constants/api, utils/apiResult e types/map.
 * CONSUMIDORES: components/map/* (AddressSearch, CepSearch, RoutePlanner,
 * MapLinkPicker) e pages/v1/map/*.
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import { normalizeItem } from '@/utils/apiResult';
import type { CallOptions } from '@/types/api';
import type {
  GeoAddress,
  GeoCepResult,
  GeoRouteRequest,
  GeoRouteResult,
  GeoSearchResult,
  GeoStatus,
} from '@/types/map';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.mapGeo}`;

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Resposta vazia do servidor (${what})`);
  return value;
}

export const mapGeo = {
  /** Quais provedores estao configurados (a chave nunca aparece). */
  status: async (opts?: CallOptions): Promise<GeoStatus> =>
    required(normalizeItem<GeoStatus>(await http.get(`${base}/status`, opts)), 'status'),

  /** Endereco ou nome de rua -> lista de resultados georreferenciados. */
  search: async (
    q: string,
    params: { limit?: number; country?: string; viewbox?: string } = {},
    opts?: CallOptions,
  ): Promise<GeoSearchResult> => {
    const query = new URLSearchParams({ q });
    if (params.limit) query.set('limit', String(params.limit));
    if (params.country) query.set('country', params.country);
    if (params.viewbox) query.set('viewbox', params.viewbox);
    return required(
      normalizeItem<GeoSearchResult>(await http.get(`${base}/search?${query.toString()}`, opts)),
      'search',
    );
  },

  /** Coordenada -> endereco (404 do servidor vira ApiError). */
  reverse: async (lat: number, lng: number, opts?: CallOptions): Promise<GeoAddress> => {
    const data = required(
      normalizeItem<{ item: GeoAddress }>(await http.get(`${base}/reverse?lat=${lat}&lng=${lng}`, opts)),
      'reverse',
    );
    return data.item;
  },

  /** CEP (so digitos ou com mascara) -> endereco + coordenada; grava map_postal_codes. */
  cep: async (cep: string, refresh = false, opts?: CallOptions): Promise<GeoCepResult> => {
    const digits = cep.replace(/\D/g, '');
    return required(
      normalizeItem<GeoCepResult>(
        await http.get(`${base}/cep/${digits}${refresh ? '?refresh=1' : ''}`, opts),
      ),
      'cep',
    );
  },

  /** Trajeto, distancia e tempo; com `save` grava map_routes + map_route_stops. */
  route: async (body: GeoRouteRequest, opts?: CallOptions): Promise<GeoRouteResult> =>
    required(normalizeItem<GeoRouteResult>(await http.post(`${base}/route`, body, opts)), 'route'),
};

export default mapGeo;
