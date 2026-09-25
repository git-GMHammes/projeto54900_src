/**
 * =============================================================================
 * FILE HEADER — auth.ts (types) — contratos do módulo de autenticação
 * =============================================================================
 *
 * O QUE FAZ: declara as formas de dado que circulam na autenticação: o usuário
 *   logado (com seu papel), o par de tokens e a resposta do login.
 *
 * DE ONDE VÊM OS DADOS: espelham o retorno de
 *   `Services/V1/Auth/AuthService.php` do back-end (login, refresh e me). Se o
 *   back-end mudar um campo, é AQUI que o contrato muda primeiro — o resto do
 *   front acompanha.
 *
 * FLUXO (onde cada tipo aparece):
 *   `services/v1/auth.service.ts` (`AuthPayload`/`AuthUser`)
 *     -> `context/AuthContext.tsx` (guarda os tokens e publica o `AuthUser`)
 *        -> `useAuth()` (consumido por `LoginPage` e por telas que exibem o papel)
 *
 * DEPENDÊNCIAS: nenhuma — tipos puros, sem import.
 *
 * CONSUMIDORES: `services/v1/auth.service.ts` (tipa a resposta do login/refresh)
 *   e `context/AuthContext.tsx` (tipa o usuário do estado global).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. os nomes em `snake_case` (`access_token`, `last_login_at`, ...) SÃO DE
 *      PROPÓSITO: é o formato que o back-end devolve. Não "melhorar" para
 *      camelCase — isso exigiria conversão em toda a camada;
 *   2. campo novo no payload do back-end só vira tipo aqui quando algum código do
 *      front for usá-lo: o tipo descreve o contrato EM USO, não o banco todo;
 *   3. `AuthTokens` é reusado por `AuthPayload` via `extends`: tokens e usuário
 *      chegam juntos no login, mas o `refresh` devolve SÓ tokens.
 *
 * COMO REPLICAR PARA OUTRO MÓDULO: crie `types/<modulo>.ts` espelhando o payload
 *   do service do back-end, com um tipo por nível de aninhamento, e importe-os no
 *   service correspondente.
 * =============================================================================
 */

/**
 * =============================================================================
 * BLOCO 1 — USUÁRIO E PAPEL (`AuthRole` / `AuthUser`)
 * =============================================================================
 *
 * `AuthRole` — o papel do usuário: `id`, `name` e `slug`. O `slug` é o que as
 *   regras do front comparam (ex.: esconder uma ação por papel); o `name` é o
 *   rótulo para exibição.
 *
 * `AuthUser`:
 *   id            -> identificador do usuário;
 *   username      -> login usado na autenticação;
 *   full_name     -> nome completo (user_profiles.name), ou `null` quando o
 *                    usuário ainda não tem perfil (user_profiles) cadastrado —
 *                    telas que exibem o nome tratam esse caso (fallback pro
 *                    username);
 *   status        -> estado do usuário como texto; quem interpreta é a tela;
 *   last_login_at -> ÚLTIMO ACESSO, ou `null` quando o usuário nunca entrou —
 *                    aqui o nulo é informativo, não erro;
 *   role          -> o papel, ou `null` quando não há papel atribuído. É o caso
 *                    que as telas precisam tratar ANTES de checar permissão:
 *                    nunca assumir que `role` existe.
 *
 * QUEM CONSOME: `context/AuthContext.tsx` (publica o usuário) e, por ele, as
 *   telas que mostram dados do logado.
 * -------------------------------------------------------------------------
 */
export interface AuthRole {
  id: number;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: number;
  username: string;
  full_name: string | null;
  status: string;
  last_login_at: string | null;
  role: AuthRole | null;
}

/**
 * =============================================================================
 * BLOCO 2 — `AuthTokens`: O PAR DE TOKENS
 * =============================================================================
 *
 * O QUE É: exatamente o que a API devolve ao autenticar.
 *   access_token  -> token de acesso; é ele que vai no header
 *                    `Authorization: Bearer ...` (via `setAccessTokenGetter`, em
 *                    `services/http.ts`);
 *   refresh_token -> usado para renovar a sessão quando o access expira;
 *   token_type    -> fixo 'Bearer' — literal de propósito: descreve o ESQUEMA do
 *                    header, não um valor livre;
 *   expires_in    -> validade do access token, em SEGUNDOS; é o que permite
 *                    agendar o refresh em vez de descobrir a expiração por 401.
 *
 * QUEM CONSOME: `services/v1/auth.service.ts` (tipa a resposta) e
 *   `context/AuthContext.tsx` (decide onde guardar cada token).
 *   NADA AQUI DIZ COMO ARMAZENAR — isso é decisão do contexto, não do tipo.
 * -------------------------------------------------------------------------
 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * =============================================================================
 * BLOCO 3 — `AuthPayload`: A RESPOSTA DO LOGIN
 * =============================================================================
 *
 * O QUE É: `AuthTokens` (BLOCO 2) MAIS o usuário autenticado. É o corpo devolvido
 *   pelo login: em UMA resposta chegam credenciais e identidade.
 *
 * POR QUE `extends AuthTokens`: as telas precisam dos DOIS ao mesmo tempo
 *   (guardar os tokens e já publicar o usuário), mas o `refresh` devolve só
 *   tokens — por isso o tipo base é `AuthTokens` e não um objeto único e rígido.
 *
 * `user` É ANULÁVEL (`AuthUser | null`) por fidelidade à resposta: o fluxo de
 *   login sempre traz usuário, mas o contrato não pode afirmar isso sem o
 *   back-end garantir. Quem consome trata o caso nulo em vez de confiar.
 *
 * QUEM CONSOME: `services/v1/auth.service.ts` (retorno tipado do login) e
 *   `context/AuthContext.tsx`.
 * -------------------------------------------------------------------------
 */
export interface AuthPayload extends AuthTokens {
  user: AuthUser | null;
}
