/**
 * =========================================================================
 * FILE HEADER — context/AppConfigContext.tsx
 * =========================================================================
 *
 * PROPOSITO: config global do app disponivel em toda a arvore (nome da
 * aplicacao, versao de API ativa, base de URL, ambiente dev/prod). Valor
 * estatico (calculado uma vez com useMemo, sem estado que muda em runtime)
 * — existe como Context so para nao precisar reimportar config/env e
 * constants/api em cada componente que precisa desses valores.
 *
 * DEPENDENCIAS: config/env (env), constants/api (DEFAULT_API_VERSION).
 * CONSUMIDORES: components/layout/Navbar.tsx (appName, apiVersion exibidos
 * no header); App.tsx monta o Provider na raiz da arvore.
 *
 * COMO REAPROVEITAR: envolver a arvore com <AppConfigProvider> uma vez (ja
 * feito em App.tsx) e chamar useAppConfig() em qualquer componente
 * descendente para ler appName/apiVersion/apiBaseUrl/basePath/isDev.
 * -------------------------------------------------------------------------
 */

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

/** Provider raiz: calcula o AppConfig uma vez (useMemo) e o disponibiliza para toda a arvore. */
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

/** Hook de consumo — lanca erro se usado fora de <AppConfigProvider>. */
export function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('useAppConfig precisa estar dentro de <AppConfigProvider>.');
  return ctx;
}
