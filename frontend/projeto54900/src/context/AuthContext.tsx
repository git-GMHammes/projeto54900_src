/**
 * =========================================================================
 * FILE HEADER — context/AuthContext.tsx
 * =========================================================================
 *
 * PROPOSITO: sessao do usuario — access_token em memoria (useRef, nunca
 * persistido) e refresh_token em sessionStorage (sobrevive a F5, some ao
 * fechar a aba). Ao montar, tenta um refresh silencioso se houver
 * refresh_token salvo, para restaurar a sessao sem pedir login de novo.
 *
 * Registra o getter do access_token em services/http.ts
 * (setAccessTokenGetter) para toda chamada HTTP incluir
 * "Authorization: Bearer" quando logado — hoje isso so importa para
 * auth/me e auth/logout (unico grupo protegido).
 *
 * DEPENDENCIAS: services/v1/auth.service.ts (login/refresh/logout),
 * services/http (setAccessTokenGetter) e types/auth (AuthUser).
 * CONSUMIDORES: App.tsx monta <AuthProvider> na raiz da arvore;
 * pages/v1/auth/LoginPage.tsx chama login(); qualquer componente pode
 * consumir useAuth() para ler user/isAuthenticated/bootstrapping ou disparar
 * logout().
 *
 * COMO REAPROVEITAR: chamar useAuth() em qualquer componente descendente do
 * Provider; usar `bootstrapping` para nao piscar tela de login antes do
 * refresh silencioso terminar.
 * -------------------------------------------------------------------------
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/v1/auth.service';
import { setAccessTokenGetter } from '@/services/http';
import type { AuthUser } from '@/types/auth';

const REFRESH_TOKEN_KEY = 'projeto54900.refresh_token';

export interface AuthApi {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** true enquanto o refresh silencioso inicial esta em andamento. */
  bootstrapping: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Le o refresh_token salvo em sessionStorage; null se ausente ou storage indisponivel. */
function readStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Grava (ou remove, se null) o refresh_token em sessionStorage. */
function storeRefreshToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // sessionStorage indisponivel (modo privado etc.) — sessao vira so-em-memoria.
  }
}

/**
 * Provider da sessao: guarda o access_token em ref (memoria, nunca
 * persistido) e tenta restaurar a sessao ao montar via refresh silencioso
 * (se houver refresh_token em sessionStorage).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  // Expoe o access_token atual para services/http.ts sem prop-drilling nem
  // recriar o client HTTP a cada render.
  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current);
    return () => setAccessTokenGetter(null);
  }, []);

  // Refresh silencioso na montagem: se houver refresh_token salvo, tenta
  // trocar por um access_token novo antes de decidir se o usuario esta logado.
  useEffect(() => {
    const stored = readStoredRefreshToken();
    if (!stored) {
      setBootstrapping(false);
      return;
    }

    authService
      .refresh(stored)
      .then((payload) => {
        accessTokenRef.current = payload.access_token;
        storeRefreshToken(payload.refresh_token);
        setUser(payload.user);
      })
      .catch(() => {
        storeRefreshToken(null);
      })
      .finally(() => setBootstrapping(false));
  }, []);

  /** Autentica, guarda o access_token em memoria e persiste o refresh_token. */
  const login = useCallback(async (username: string, password: string) => {
    const payload = await authService.login(username, password);
    accessTokenRef.current = payload.access_token;
    storeRefreshToken(payload.refresh_token);
    setUser(payload.user);
  }, []);

  /** Encerra a sessao no backend (best-effort) e sempre limpa a sessao local. */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // best-effort — mesmo se a chamada falhar, a sessao local e limpa abaixo.
    }
    accessTokenRef.current = null;
    storeRefreshToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ user, isAuthenticated: user !== null, bootstrapping, login, logout }),
    [user, bootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook de consumo — lanca erro se usado fora de <AuthProvider>. */
export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
