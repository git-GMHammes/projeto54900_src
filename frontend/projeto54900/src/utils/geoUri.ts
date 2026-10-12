/**
 * =========================================================================
 * FILE HEADER — utils/geoUri.ts
 * =========================================================================
 *
 * PROPOSITO: formato da localizacao compartilhada em mensagens: o padrao "geo URI" (RFC 5870),
 * `geo:LAT,LNG;u=PRECISAO_EM_METROS`, escrito dentro do texto da mensagem. A posicao viaja
 * junto da mensagem e herda as regras de privacidade dela (nada e gravado em map_points).
 *
 *   buildLocationMessage('Praça Mauá, Centro', fix) -> "Localização compartilhada: Praça Mauá, Centro (geo:-22.896300,-43.177900;u=15)"
 *   splitGeoUri(content) -> { text, geo }   // text = mensagem sem o geo URI; geo = posicao ou null
 *
 * CONSUMIDORES: components/map/ShareLocationModal.tsx (monta) e
 * pages/v1/messages/chat/ConversationPane.tsx (le, para mostrar "Ver no mapa").
 * -------------------------------------------------------------------------
 */

export interface GeoFix {
  lat: number;
  lng: number;
  /** Raio de precisao em metros (pode ser 0 quando desconhecido). */
  accuracy: number;
}

const GEO_URI = /geo:(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:;u=(\d+(?:\.\d+)?))?/;

/** `geo:-22.906800,-43.172900;u=15` (6 casas decimais, ~11 cm; precisao arredondada para metros). */
export function buildGeoUri(fix: GeoFix): string {
  const base = `geo:${fix.lat.toFixed(6)},${fix.lng.toFixed(6)}`;
  return fix.accuracy > 0 ? `${base};u=${Math.round(fix.accuracy)}` : base;
}

/** Texto da mensagem de localizacao; `address` e opcional (geocodificacao reversa). */
export function buildLocationMessage(address: string | null, fix: GeoFix): string {
  const where = address ? `${address} ` : '';
  return `Localização compartilhada: ${where}(${buildGeoUri(fix)})`;
}

/** Separa o geo URI do texto. `geo` so vem preenchido se as coordenadas estiverem nas faixas validas. */
export function splitGeoUri(content: string): { text: string; geo: GeoFix | null } {
  const match = GEO_URI.exec(content);
  if (match === null) return { text: content, geo: null };

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  const accuracy = match[3] !== undefined ? Number(match[3]) : 0;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { text: content, geo: null };
  }

  // Remove o geo URI e os parenteses que o envolvem; deixa o resto do texto como esta.
  const text = content
    .replace(match[0], '')
    .replace(/\(\s*\)/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { text, geo: { lat, lng, accuracy } };
}

/** Link do OpenStreetMap para abrir a posicao em outra aba. */
export function openStreetMapUrl(fix: GeoFix): string {
  return `https://www.openstreetmap.org/?mlat=${fix.lat}&mlon=${fix.lng}#map=17/${fix.lat}/${fix.lng}`;
}
