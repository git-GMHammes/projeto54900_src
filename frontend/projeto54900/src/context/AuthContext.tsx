// Sessao do usuario: access_token em memoria (state), refresh_token em
// sessionStorage (sobrevive a F5, some ao fechar a aba). Ao montar, tenta um
// refresh silencioso se houver refresh_token salvo. Consumir por useAuth().
//
// Registra o getter do access_token em services/http.ts (setAccessTokenGetter)
// para toda chamada HTTP incluir "Authorization: Bearer" quando logado — hoje
// isso so importa para auth/me e auth/logout (unico grupo protegido).

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

function readStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeRefreshToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // sessionStorage indisponivel (modo privado etc.) — sessao vira so-em-memoria.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current);
    return () => setAccessTokenGetter(null);
  }, []);

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

  const login = useCallback(async (username: string, password: string) => {
    const payload = await authService.login(username, password);
    accessTokenRef.current = payload.access_token;
    storeRefreshToken(payload.refresh_token);
    setUser(payload.user);
  }, []);

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

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
