/**
 * =========================================================================
 * FILE HEADER — routes/v1/user.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Usuários (v1), paths relativos ao pai "/v1".
 * Espelha `api/v1/user-manager` (+ `-view`) do backend. As páginas seguem a
 * convenção do projeto por recurso/ação:
 * `pages/v1/user/user-manager/{GetAllPage,CreatePage,GetPage,UpdatePage}.tsx`
 * (ver `README_paginas_modulo.md`).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   user-manager            -> GetAllPage   lista de usuários (motor do Construtor
 *                                           de Listas, definição de slug
 *                                           'user-manager' + busca com debounce)
 *   user-manager/create     -> CreatePage   formulário do build 'cadastro-usuario'
 *   user-manager/:id        -> GetPage      detalhe SOMENTE LEITURA (via -view)
 *   user-manager/update/:id -> UpdatePage   formulário do build 'atualizar-usuario'
 *   register                -> RegisterPage fluxo COMPOSTO de cadastro (login +
 *                                           perfil, 2 tabelas ligadas por FK)
 *
 * O FLUXO COMPOSTO NÃO FICA NO RECURSO: o wizard (login + perfil) mora em
 *   `pages/v1/user/register/RegisterPage.tsx` — atravessa duas tabelas ligadas
 *   por FK e não é o CRUD de `user-manager`. Ver o header daquele arquivo para
 *   o detalhe das etapas.
 *
 * DEPENDÊNCIAS: `pages/v1/user/user-manager/*` e
 *   `pages/v1/user/register/RegisterPage` (todos com lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...userRoutes`; a navbar usa
 *   `paths.v1.user.list` e `paths.v1.user.register`; os redirects internos do
 *   módulo usam `paths.v1.user.view(id)` (sucesso do create e do update) e
 *   `paths.v1.user.create` (botão "Novo usuario" da lista).
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `create`/`update`/`register` são segmentos ESTÁTICOS e vencem `:id` pelo
 *      ranking do React Router — a ordem no array não precisa mudar ao
 *      acrescentar rota. Um id cujo texto seja igual a esses nomes seria
 *      ambíguo: não renomeie as rotas estáticas para algo que colida com id.
 *   2. `:id` é o MESMO parâmetro lido por `GetPage` (`useParams`) e por
 *      `UpdatePage` (que também o manda na URL do PUT) — renomear o segmento
 *      aqui quebra as duas páginas.
 *   3. `routes/paths.ts` é a fonte das URLs: rota nova aqui exige entrada lá e
 *      ajuste dos consumidores no MESMO commit.
 *   4. Rota removida aqui deixa `paths.v1.user.*` apontando para o vazio (cai no
 *      `NotFoundPage`): remova a constante correspondente junto.
 *
 * COMO CRIAR UM MÓDULO CRUD SIMILAR (ex.: `cliente-manager`):
 *   1. criar as quatro páginas (GetAllPage/CreatePage/GetPage/UpdatePage) em
 *      `pages/v1/<modulo>/<recurso>/`;
 *   2. criar `routes/v1/<modulo>.routes.tsx` com uma rota por ação, todas com
 *      path base igual ao nome do recurso/tabela;
 *   3. registrar o array em `routes/v1/index.tsx`, criar as URLs em
 *      `routes/paths.ts` e documentar em `README_rotas_frontend.md`.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/user/user-manager/GetAllPage'));
const GetPage = lazy(() => import('@/pages/v1/user/user-manager/GetPage'));
const CreatePage = lazy(() => import('@/pages/v1/user/user-manager/CreatePage'));
const UpdatePage = lazy(() => import('@/pages/v1/user/user-manager/UpdatePage'));
const RegisterPage = lazy(() => import('@/pages/v1/user/register/RegisterPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Cinco rotas, todas filhas de "/v1": as quatro do CRUD de `user-manager`
 * (listagem, create, detalhe, update) mais o fluxo composto `register`.
 *
 * DETALHE DE MANUTENÇÃO: `update/:id` está DEPOIS de `:id` no array e ainda
 * assim é alcançada, porque o React Router pontua o segmento estático
 * ("update") acima do dinâmico (":id"). Reordenar NÃO muda o comportamento —
 * o que muda é o texto dos segmentos.
 *
 * O `element` recebe o componente por lazy import: o código de cada página é
 * baixado só quando a rota é visitada.
 * -------------------------------------------------------------------------
 */
export const userRoutes: RouteObject[] = [
  { path: 'user-manager', element: <GetAllPage /> },
  { path: 'user-manager/create', element: <CreatePage /> },
  { path: 'user-manager/:id', element: <GetPage /> },
  { path: 'user-manager/update/:id', element: <UpdatePage /> },
  { path: 'register', element: <RegisterPage /> },
];

export default userRoutes;
