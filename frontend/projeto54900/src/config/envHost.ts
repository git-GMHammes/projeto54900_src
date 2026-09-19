/**
 * =========================================================================
 * FILE HEADER — config/envHost.ts
 * =========================================================================
 *
 * PROPOSITO: validador global de ambiente (host) — espelho do
 * env_host.js (core legado). Fonte unica da lista de hosts de
 * desenvolvimento e da checagem usada pelo frontend V2 para decidir se um
 * comportamento dev-only (ex.: painel de debug de respostas de API) deve
 * aparecer.
 *
 * Uso:
 *   isDevHost()                     // usa window.location.hostname
 *   isDevHost('172.21.75.197')
 *   DEV_HOSTS                       // lista, para overrides pontuais
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; le window.location quando
 * disponivel).
 * CONSUMIDORES: components/global/ApiDebugPanel.tsx (so renderiza o painel
 * de debug em host de desenvolvimento).
 *
 * COMO REAPROVEITAR: chamar isDevHost() para condicionar qualquer feature
 * dev-only nova; adicionar um host novo em DEV_HOSTS em vez de checar o
 * hostname manualmente em outro arquivo.
 * -------------------------------------------------------------------------
 */

export const DEV_HOSTS: readonly string[] = [
  'localhost',
  '127.0.0.1',
  '::1',
  'podman.local',
  '172.21.75.197',
  '10.250.13.200',
  'diarias-diarias-dev.apps.ocp.qa2.detran.rj.gov.br',
  'diarias-diarias-hml.apps.ocp.qa2.detran.rj.gov.br',
];

/** Checa se um hostname (ou o hostname atual do browser) esta em DEV_HOSTS. */
export function isDevHost(hostname?: string): boolean {
  const h = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  return DEV_HOSTS.includes(h);
}
