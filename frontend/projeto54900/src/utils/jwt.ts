/**
 * =========================================================================
 * FILE HEADER — utils/jwt.ts
 * =========================================================================
 *
 * PROPOSITO: decodificacao de JWT (sem verificacao de assinatura) e busca
 * recursiva de access_token em qualquer envelope de resposta. So decodifica
 * header e payload (base64url + JSON.parse); a terceira parte do JWT
 * (assinatura) e um hash, nao carrega campos e nao e decodificavel — por
 * isso nao ha verificacao criptografica aqui. USO EXCLUSIVO DE DEBUG, nunca
 * para fins de autorizacao (a validacao real do token e responsabilidade do
 * backend).
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; usa atob/decodeURIComponent
 * nativos do browser).
 * CONSUMIDORES: services/apiDebugLog.ts (unico consumidor) — usa
 * findAccessToken() para localizar o token em qualquer resposta de login/
 * refresh e decodeJwt() para exibir header+claims no console de debug.
 *
 * COMO REAPROVEITAR: nao reaproveitar para logica de autorizacao — se um
 * dia for preciso VALIDAR um token no front (expiracao, claims), criar um
 * modulo separado que deixe essa responsabilidade explicita, sem reusar
 * este arquivo de debug.
 * -------------------------------------------------------------------------
 */

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

/**
 * Decodifica header e payload de um JWT (sem checar assinatura).
 * @param token JWT completo ("header.payload.assinatura")
 * @returns { header, payload } ou null se o token estiver malformado
 */
export function decodeJwt(token: string): DecodedJwt | null {
  const [headerPart, payloadPart] = token.split('.');
  if (!headerPart || !payloadPart) return null;
  try {
    const header = JSON.parse(base64UrlDecode(headerPart)) as Record<string, unknown>;
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as Record<string, unknown>;
    return { header, payload };
  } catch {
    return null;
  }
}

/**
 * Busca recursiva por um campo "access_token" (string) em qualquer nivel de
 * um payload de resposta de API — cobre envelopes como { data: { access_token } }.
 */
export function findAccessToken(value: unknown, depth = 0): string | null {
  if (depth > 6 || value === null || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAccessToken(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.access_token === 'string' && record.access_token) {
    return record.access_token;
  }
  for (const key of Object.keys(record)) {
    const found = findAccessToken(record[key], depth + 1);
    if (found) return found;
  }
  return null;
}
