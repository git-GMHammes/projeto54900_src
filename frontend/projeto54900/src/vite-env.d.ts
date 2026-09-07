/// <reference types="vite/client" />

// Tipagem das variaveis de ambiente do Vite expostas ao browser (prefixo VITE_).
// A leitura real fica centralizada em src/config/env.ts.
interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_VERSION?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_DEV_BACKEND?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
