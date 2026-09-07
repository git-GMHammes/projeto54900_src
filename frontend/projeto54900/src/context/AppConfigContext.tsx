// Config global do app disponivel em toda a arvore (nome, versao de API ativa,
// ambiente). Consumir por useAppConfig().

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { env } from '@/config/env';
import { DEFAULT_API_VERSION } from '@/constants/api';

export interface AppConfig {
  appName: string;
  apiVersion: string;
  apiBaseUrl: string;
  basePath: string;
  isDev: boolean;
}

const AppConfigContext = createContext<AppConfig | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AppConfig>(
    () => ({
      appName: 'projeto54900',
      apiVersion: DEFAULT_API_VERSION,
      apiBaseUrl: env.apiBaseUrl,
      basePath: env.basePath,
      isDev: env.isDev,
    }),
    [],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('useAppConfig precisa estar dentro de <AppConfigProvider>.');
  return ctx;
}
