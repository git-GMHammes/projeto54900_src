/**
 * =========================================================================
 * FILE HEADER — context/AuthContext.tsx
 * =========================================================================
 *
 * PROPOSITO: sessao do usuario — access_token em memoria (useRef, nunca
 * persistido) e refresh_token em localStorage (sobrevive a F5 e a abas/janelas
 * novas da mesma origem, some so no logout). Ao montar, restaura a sessao sem
 * pedir login de novo: primeiro pergunta as OUTRAS ABAS (BroadcastChannel) se ja
 * ha uma sessao ativa e a adota; so se ninguem responder faz o refresh silencioso.
 *
 * POR QUE O CANAL ENTRE ABAS: o servidor guarda UMA sessao por usuario (cada refresh
 * troca o par de tokens e invalida o access_token anterior). Sem aviso, cada aba nova
 * girava o refresh_token e derrubava o access_token das outras, que giravam de volta:
 * uma tempestade de refresh e 401, e uma corrida ruim apagava o refresh_token e pedia
 * login em todas as janelas. Agora quem renova AVISA as demais com o access_token novo
 * (so em memoria, via BroadcastChannel), a aba nova ADOTA a sessao de quem ja tem uma,
 * e logout em uma aba encerra as outras.
 *
 * Registra o getter do access_token em services/http.ts
 * (setAccessTokenGetter) para toda chamada HTTP incluir
 * "Authorization: Bearer" quando logado, e o PORTAO de sessao (setAuthGate): chamada
 * a API espera o refresh inicial terminar, em vez de sair sem token e levar 401.
 *
 * DEPENDENCIAS: services/v1/auth.service.ts (login/refresh/logout),
 * services/http (setAccessTokenGetter, setTokenRefresher, setAuthGate),
 * services/apiDebugLog (clear no logout) e types/auth (AuthUser).
 * CONSUMIDORES: App.tsx monta <AuthProvider> na raiz da arvore;
 * pages/v1/auth/LoginPage.tsx chama login(); components/layout/Navbar.tsx
 * chama logout() no botao "Sair"; qualquer componente pode
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
import { ApiError, setAccessTokenGetter, setAuthGate, setTokenRefresher } from '@/services/http';
import { decodeJwt } from '@/utils/jwt';
import { clear as clearApiDebugLog } from '@/services/apiDebugLog';
import type { AuthUser } from '@/types/auth';

const REFRESH_TOKEN_KEY = 'projeto54900.refresh_token';

/** Renova o access_token este tanto de segundos ANTES de expirar (e nunca com menos de 5 s de espera). */
const REFRESH_MARGIN_SECONDS = 60;

/** Canal entre abas/janelas da mesma origem (mensagens so em memoria; o refresh_token continua so no localStorage). */
const CHANNEL_NAME = 'projeto54900.auth';

/** Quanto esperar a resposta das outras abas (e o broadcast de uma renovacao em curso) antes de girar o token. */
const PEER_WAIT_MS = 400;

/** Teto da espera do portao de sessao: se o refresh inicial travar, as chamadas seguem sem token em vez de ficar presas. */
const BOOT_GATE_TIMEOUT_MS = 10_000;

export interface AuthApi {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** true enquanto o refresh silencioso inicial esta em andamento. */
  bootstrapping: boolean;
  /** Devolve o slug da empresa pela qual entrou (monta a URL pos-login) ou null. */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /** Recarrega o usuario autenticado (auth/me) — usado apos editar o proprio perfil, para o full_name exibido na Navbar acompanhar a troca. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Mensagens do canal: `ask` (aba nova pergunta), `session` (quem tem sessao responde/avisa renovacao) e `logout`. */
type PeerMessage = { type: 'ask' } | { type: 'logout' } | { type: 'session'; access_token: string; user: AuthUser };

function isPeerMessage(value: unknown): value is PeerMessage {
  if (typeof value !== 'object' || value === null) return false;
  const rec = value as { type?: unknown; access_token?: unknown; user?: unknown };
  if (rec.type === 'ask' || rec.type === 'logout') return true;
  return rec.type === 'session' && typeof rec.access_token === 'string' && typeof rec.user === 'object' && rec.user !== null;
}

/** Le o refresh_token salvo em localStorage; null se ausente ou storage indisponivel. */
function readStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Grava (ou remove, se null) o refresh_token em localStorage. */
function storeRefreshToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // localStorage indisponivel (modo privado etc.) — sessao vira so-em-memoria.
  }
}

const REFRESH_LOCK_NAME = 'projeto54900.refresh';

type AuthPayload = Awaited<ReturnType<typeof authService.refresh>>;

/** Roda `fn` em exclusao mutua entre abas (Web Locks); sem a API, roda direto. */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  return 'locks' in navigator ? navigator.locks.request(REFRESH_LOCK_NAME, fn) : fn();
}

/**
 * Troca o refresh_token salvo por um par novo. O refresh_token gira a cada uso (o servidor guarda um unico hash),
 * entao a troca e serializada entre abas e o token e RELIDO do localStorage dentro do lock — assim quem espera
 * usa o token que a aba anterior acabou de gravar, nunca um ja gasto. Devolve null se nao ha token salvo.
 * Recusa do servidor (4xx): se OUTRA aba gravou um token mais novo enquanto esta tentava, tenta de novo com ele
 * (corrida entre abas nao pode encerrar a sessao); se nao ha token novo, apaga o token. Falha de rede o preserva.
 */
function rotateRefreshToken(): Promise<AuthPayload | null> {
  return withRefreshLock(async () => {
    let stored = readStoredRefreshToken();
    for (let attempt = 0; stored; attempt++) {
      try {
        const payload = await authService.refresh(stored);
        storeRefreshToken(payload.refresh_token);
        return payload;
      } catch (err) {
        if (!(err instanceof ApiError) || err.status < 400 || err.status >= 500) throw err;
        const latest = readStoredRefreshToken();
        if (attempt < 2 && latest && latest !== stored) {
          stored = latest;
          continue;
        }
        storeRefreshToken(null);
        throw err;
      }
    }
    return null;
  });
}

/**
 * Canal unico por pagina. Nao e fechado ao desmontar o Provider: o StrictMode (dev) monta, desmonta e monta de novo, e
 * um canal fechado no meio descartaria as respostas das outras abas (e a aba giraria o refresh_token sem precisar).
 */
let sharedChannel: BroadcastChannel | null | undefined;

function getSharedChannel(): BroadcastChannel | null {
  if (sharedChannel === undefined) {
    try {
      sharedChannel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
    } catch {
      sharedChannel = null;
    }
  }
  return sharedChannel;
}

/** Restauracao inicial em andamento: o StrictMode monta o efeito 2x e nao pode perguntar/girar o token duas vezes. */
let bootInFlight: Promise<void> | null = null;

/** Portao de sessao (ver services/http.ts): resolve quando o refresh inicial termina, ou apos o teto de espera. */
let markBootReady: () => void = () => undefined;
const bootReady = new Promise<void>((resolve) => {
  markBootReady = resolve;
});
const bootGate: Promise<void> = Promise.race([bootReady, new Promise<void>((resolve) => setTimeout(resolve, BOOT_GATE_TIMEOUT_MS))]);

/**
 * Provider da sessao: guarda o access_token em ref (memoria, nunca
 * persistido) e tenta restaurar a sessao ao montar (outras abas primeiro, depois refresh silencioso
 * se houver refresh_token em localStorage).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  /** Refresh_token (do localStorage) a que a sessao DESTA aba corresponde; difere do salvo = outra aba ja girou. */
  const syncedRefreshRef = useRef<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Expoe o access_token atual para services/http.ts sem prop-drilling nem
  // recriar o client HTTP a cada render.
  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current);
    setAuthGate(() => bootGate);
    return () => {
      setAccessTokenGetter(null);
      setAuthGate(null);
    };
  }, []);

  /** Assume uma sessao (propria ou recebida de outra aba): access_token em memoria, usuario e refresh correspondente. */
  const commitSession = useCallback((access: string, nextUser: AuthUser | null) => {
    accessTokenRef.current = access;
    userRef.current = nextUser;
    syncedRefreshRef.current = readStoredRefreshToken();
    setUser(nextUser);
  }, []);

  /** Encerra a sessao SO desta aba (memoria e estado); o refresh_token e apagado por quem decidiu encerrar. */
  const dropSession = useCallback(() => {
    accessTokenRef.current = null;
    userRef.current = null;
    syncedRefreshRef.current = null;
    clearApiDebugLog();
    setUser(null);
  }, []);

  const publishSession = useCallback((access: string, nextUser: AuthUser | null) => {
    if (nextUser) channelRef.current?.postMessage({ type: 'session', access_token: access, user: nextUser } satisfies PeerMessage);
  }, []);

  // Canal entre abas: adota a sessao que outra aba renovou ou abriu, responde "quem tem sessao?" e propaga logout.
  useEffect(() => {
    const channel = getSharedChannel();
    channelRef.current = channel;
    if (!channel) return undefined;
    const peers = channel;
    peers.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (!isPeerMessage(message)) return;
      if (message.type === 'session') commitSession(message.access_token, message.user);
      else if (message.type === 'logout') dropSession();
      else if (accessTokenRef.current && userRef.current) {
        peers.postMessage({ type: 'session', access_token: accessTokenRef.current, user: userRef.current } satisfies PeerMessage);
      }
    };
    return () => {
      peers.onmessage = null;
    };
  }, [commitSession, dropSession]);

  /** Pergunta as outras abas se ha sessao; true se alguma respondeu (a resposta ja foi adotada pelo onmessage). */
  const askPeers = useCallback(
    (): Promise<boolean> =>
      new Promise((resolve) => {
        const channel = channelRef.current;
        if (!channel) {
          resolve(false);
          return;
        }
        const onReply = (event: MessageEvent<unknown>) => {
          if (isPeerMessage(event.data) && event.data.type === 'session') {
            window.clearTimeout(timer);
            channel.removeEventListener('message', onReply);
            resolve(true);
          }
        };
        const timer = window.setTimeout(() => {
          channel.removeEventListener('message', onReply);
          resolve(false);
        }, PEER_WAIT_MS);
        channel.addEventListener('message', onReply);
        channel.postMessage({ type: 'ask' } satisfies PeerMessage);
      }),
    [],
  );

  /** Espera (ate PEER_WAIT_MS) o broadcast de uma renovacao que outra aba acabou de fazer para o `stored` atual. */
  const waitForPeerRenewal = useCallback(async (stored: string): Promise<boolean> => {
    const deadline = Date.now() + PEER_WAIT_MS;
    while (Date.now() < deadline) {
      if (syncedRefreshRef.current === stored) return true;
      await new Promise<void>((resolve) => setTimeout(resolve, 40));
    }
    return syncedRefreshRef.current === stored;
  }, []);

  const timerRef = useRef<number | null>(null);

  /**
   * Renova a sessao. Se OUTRA aba ja girou o refresh_token (o salvo difere do desta aba), espera o access_token novo
   * dela em vez de girar de novo (girar derrubaria as demais). Senao troca o refresh_token salvo por um par novo
   * (access em memória, refresh em localStorage) e AVISA as outras abas. Falhou de vez (refresh vencido/revogado) ou
   * o token foi apagado (logout em outra aba): encerra a sessão local e o RequireAuth leva ao login. true se renovou.
   */
  const renewSession = useCallback(async (): Promise<boolean> => {
    const stored = readStoredRefreshToken();
    if (stored && stored !== syncedRefreshRef.current && channelRef.current && (await waitForPeerRenewal(stored))) return true;
    try {
      const payload = await rotateRefreshToken();
      if (!payload) {
        if (userRef.current) dropSession();
        return false;
      }
      commitSession(payload.access_token, payload.user);
      publishSession(payload.access_token, payload.user);
      return true;
    } catch (err) {
      // Só derruba a sessão se o servidor recusou o refresh; falha de rede mantém a sessão para tentar de novo.
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        storeRefreshToken(null);
        dropSession();
        channelRef.current?.postMessage({ type: 'logout' } satisfies PeerMessage);
      }
      return false;
    }
  }, [commitSession, dropSession, publishSession, waitForPeerRenewal]);

  useEffect(() => {
    setTokenRefresher(renewSession);
    return () => setTokenRefresher(null);
  }, [renewSession]);

  // Renovação preventiva: agenda a troca um pouco antes do exp do access_token (reagenda a cada token novo), para o
  // polling do chat nem chegar a receber 401. Aba em segundo plano pode atrasar o timer — o 401 do http.ts cobre.
  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const token = accessTokenRef.current;
    if (!user || !token) return;
    const exp = Number(decodeJwt(token)?.payload.exp);
    if (!Number.isFinite(exp)) return;
    const waitMs = Math.max(5, exp - Math.floor(Date.now() / 1000) - REFRESH_MARGIN_SECONDS) * 1000;
    timerRef.current = window.setTimeout(() => {
      void renewSession();
    }, waitMs);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [user, renewSession]);

  // Restauracao na montagem: sem refresh_token salvo nao ha sessao; com ele, adota a sessao de outra aba aberta
  // (sem girar o token) ou, se ninguem responder, faz o refresh silencioso antes de decidir se o usuario esta logado.
  useEffect(() => {
    const finish = () => {
      setBootstrapping(false);
      markBootReady();
    };
    if (!readStoredRefreshToken()) {
      finish();
      return;
    }

    bootInFlight ??= (async () => {
      if (await askPeers()) return;
      try {
        const payload = await rotateRefreshToken();
        if (payload) {
          commitSession(payload.access_token, payload.user);
          publishSession(payload.access_token, payload.user);
        }
      } catch {
        // rotateRefreshToken ja apagou o token se o servidor recusou; falha de rede mantem para a proxima tentativa.
      }
    })().finally(() => {
      bootInFlight = null;
    });
    void bootInFlight.finally(finish);
  }, [askPeers, commitSession, publishSession]);

  /** Autentica, guarda o access_token em memoria, persiste o refresh_token e avisa as outras abas. */
  const login = useCallback(
    async (username: string, password: string) => {
      const payload = await authService.login(username, password);
      storeRefreshToken(payload.refresh_token);
      commitSession(payload.access_token, payload.user);
      publishSession(payload.access_token, payload.user);
      return payload.company_slug ?? payload.user?.company_slug ?? null;
    },
    [commitSession, publishSession],
  );

  /**
   * Encerra a sessao no backend (best-effort, com Bearer + refresh_token) e
   * sempre faz a limpeza local completa: access_token em memoria,
   * refresh_token do localStorage, user e o store do painel de debug (que
   * guarda o ultimo token e o historico de respostas), e avisa as outras abas para
   * encerrarem tambem. O menu dinamico e descartado pelo useSiteMenu ao ver isAuthenticated=false.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout(readStoredRefreshToken());
    } catch {
      // best-effort — mesmo se a chamada falhar, a sessao local e limpa abaixo.
    }
    storeRefreshToken(null);
    dropSession();
    channelRef.current?.postMessage({ type: 'logout' } satisfies PeerMessage);
  }, [dropSession]);

  /** Recarrega o usuario autenticado (auth/me) — mesma sessao, dado atualizado. */
  const refreshUser = useCallback(async () => {
    const fresh = await authService.me();
    userRef.current = fresh;
    setUser(fresh);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ user, isAuthenticated: user !== null, bootstrapping, login, logout, refreshUser }),
    [user, bootstrapping, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook de consumo — lanca erro se usado fora de <AuthProvider>. */
export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
