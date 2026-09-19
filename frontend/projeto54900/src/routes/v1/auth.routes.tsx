/**
 * =========================================================================
 * FILE HEADER — routes/v1/auth.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Auth (v1), espelhando `api/v1/auth` do backend.
 * APENAS `login` tem tela própria — `refresh`, `logout` e `me` são chamados
 * direto pelo `AuthContext` (via `authService`), sem rota nem página dedicada:
 * são operações de sessão, não telas.
 *
 * MAPA DA ROTA (path relativo ao pai "/v1"):
 *   login -> pages/v1/auth/LoginPage
 *            formulário de login; ao autenticar, o `AuthContext` guarda os
 *            tokens e a página navega para `paths.home`.
 *
 * DEPENDÊNCIAS: `pages/v1/auth/LoginPage` (lazy import) e `react-router-dom`
 *   (o tipo `RouteObject`).
 *
 * CONSUMIDORES:
 *   - `routes/v1/index.tsx` espalha `...authRoutes` nos filhos de "/v1";
 *   - a navbar (link "Entrar") e o redirect de rota protegida usam
 *     `paths.v1.auth.login` — a URL em texto existe SÓ em `routes/paths.ts`.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `path: 'login'` é RELATIVO ao pai (vira "/v1/login"): não colocar barra
 *      inicial, que é o erro mais comum em rota filha.
 *   2. A página entra por `lazy` (code splitting): página nova aqui deve seguir
 *      o mesmo padrão, senão o bundle inicial cresce sem necessidade.
 *   3. `refresh`/`logout`/`me` não ganham rota por decisão de arquitetura — quem
 *      conversa com eles é o `AuthContext`. Criar página para eles mudaria o
 *      fluxo de sessão; é tarefa de arquitetura, não de rotas.
 *   4. A tela de login é PÚBLICA: ela não fica sob guarda de autenticação. Se um
 *      dia existir um wrapper de rota protegida em `routes/index.tsx`, ela é a
 *      exceção a preservar.
 *
 * COMO CRIAR UMA ROTA SIMILAR (módulo com UMA página só):
 *   1. declarar o lazy import da página;
 *   2. exportar um array com um único objeto `{ path, element }`;
 *   3. acrescentar o módulo em `routes/v1/index.tsx` e a URL em
 *      `routes/paths.ts`.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const LoginPage = lazy(() => import('@/pages/v1/auth/LoginPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Um único elemento: `/v1/login` -> `LoginPage`.
 *
 * O array é exportado como `export const` (nomeado) E como `default`: o
 * agregador (`routes/v1/index.tsx`) importa a exportação NOMEADA e espalha
 * (`...authRoutes`); o `default` serve de conveniência/consistência entre os
 * arquivos de rota do projeto.
 * -------------------------------------------------------------------------
 */
export const authRoutes: RouteObject[] = [{ path: 'login', element: <LoginPage /> }];

export default authRoutes;
