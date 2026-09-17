/**
 * =========================================================================
 * FILE HEADER — config/env.ts
 * =========================================================================
 *
 * PROPOSITO: leitura centralizada das variaveis de ambiente do Vite. Nao
 * acessar `import.meta.env` fora daqui.
 *
 * O projeto NAO usa arquivo .env e nao ha mais container de frontend. Em
 * dev (`npm run dev`) e no build (`npm run build`) os valores usados sao os
 * DEFAULTS abaixo (basePath '/', apiBaseUrl '/api', apiVersion 'v1', wsUrl
 * '/ws'). Para um deploy que precise de outros valores, exportar as chaves
 * VITE_* no ambiente do processo antes do build (o Vite le variaveis
 * prefixadas VITE_).
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; le so import.meta.env nativo do Vite).
 * CONSUMIDORES: constants/api.ts (DEFAULT_API_VERSION), services/http.ts
 * (apiBaseUrl), context/AppConfigContext.tsx (todo o objeto env),
 * config/envHost.ts nao depende deste arquivo (checagem de host separada).
 *
 * COMO REAPROVEITAR: importar `env` (nunca `import.meta.env` direto) para
 * ler qualquer valor de ambiente; usar `routerBasename` especificamente na
 * montagem do `createBrowserRouter` (routes/index.tsx).
 * -------------------------------------------------------------------------
 */

/** Remove a barra final de um path/URL, se houver (evita "//" ao concatenar). */
function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export interface AppEnv {
  /** Prefixo publico do app (ex.: "/frontend/projeto54900"). Sem barra final. */
  readonly basePath: string;
  /** Base de todas as chamadas de API (ex.: "/api"). Sem barra final. */
  readonly apiBaseUrl: string;
  /** Versao default da API usada pelos services (ex.: "v1"). */
  readonly apiVersion: string;
  /** Endpoint do WebSocket (Node). */
  readonly wsUrl: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
}

export const env: AppEnv = Object.freeze({
  basePath: trimTrailingSlash(import.meta.env.VITE_BASE_PATH || '/'),
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api'),
  apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
  wsUrl: import.meta.env.VITE_WS_URL || '/ws',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
});

/** basename do react-router: "/" quando o app roda na raiz. @see routes/index.tsx */
export const routerBasename: string = env.basePath === '' ? '/' : env.basePath;
