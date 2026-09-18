/**
 * =========================================================================
 * FILE HEADER — routes/v1/form.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Form (v1), paths relativos ao pai "/v1". Espelha
 * `api/v1/form-manager` (+ `-view`), `form-groups`, `form-rows` e `form-campos`
 * do backend — o CONSTRUTOR de formulários (a árvore manager -> grupo -> linha
 * -> campo) e o RENDERER que publica um formulário já gravado.
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   form-constructor            -> FormConstructorListPage  lista os form_manager
 *   form-constructor/create     -> FormBuilderPage          construtor NOVO
 *                                                           (árvore manager ->
 *                                                           grupos -> linhas ->
 *                                                           campos)
 *   form-constructor/update/:id -> FormBuilderPage          MESMA tela em modo
 *                                                           edição, hidratada com
 *                                                           o registro existente
 *   form-constructor-claude     -> FormConstructorPage      construtor LEGADO
 *                                                           (view_form_manager).
 *                                                           NÃO MEXER.
 *   form/:slug                  -> FormRendererPage         renderiza UM formulário
 *                                                           real a partir da
 *                                                           definição gravada e faz
 *                                                           o submit no
 *                                                           `submit_endpoint` do
 *                                                           registro
 *
 * DUAS FAMÍLIAS DE TELA, UM MÓDULO: as rotas `form-constructor*` são FERRAMENTA
 *   (quem monta formulários); `form/:slug` é PRODUTO (quem usa o formulário
 *   montado). Quem consome `/v1/form/:slug` são telas do sistema (por exemplo o
 *   build fixo `cadastro-usuario` do `CreatePage` de user-manager usa o mesmo
 *   pipeline interno, sem passar por esta rota).
 *
 * O WIZARD DE CADASTRO NÃO FICA AQUI: o fluxo composto (login + perfil) mora em
 *   `pages/v1/user/register/RegisterPage.tsx`, rota `/v1/register` (ver
 *   `user.routes.tsx`) — é um fluxo do módulo user, não do módulo form.
 *
 * DEPENDÊNCIAS: `pages/v1/form/{FormConstructorListPage,FormBuilderPage,
 *   FormConstructorPage,FormRendererPage}` (todos com lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...formRoutes`; a navbar usa
 *   `paths.v1.form.list`; links internos usam `paths.v1.form.render(slug)`
 *   (ex.: abrir o formulário publicado) e as rotas de create/update do
 *   construtor.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `form/:slug` é PREFIXO CORINGA: qualquer `/v1/form/<algo>` cai nele. Rota
 *      nova sob `form/` precisa ser mais específica que o coringa — e um slug de
 *      formulário que coincida com um nome de rota passaria a ser inalcançável.
 *   2. `form-constructor-claude` é LEGADO e serve de referência histórica do
 *      construtor antigo: não apagar nem "modernizar" sem decidir a migração —
 *      é tarefa de produto.
 *   3. `form-constructor` x `form-constructor-claude` são paths DISTINTOS (o
 *      segundo é uma rota separada, não uma variação do primeiro).
 *   4. `path` é relativo ao pai "/v1", sem barra inicial; e `routes/paths.ts`
 *      é a fonte das URLs usadas pela aplicação.
 *   5. Os builds de formulário (slug, grupos, campos) NÃO estão neste arquivo:
 *      vivem no banco. Rota nova aqui não cria formulário — cria ACESSO.
 *
 * COMO CRIAR UM CONSTRUTOR SIMILAR (árvore em três/quatro níveis): o mesmo
 *   padrão está replicado em `list.routes.tsx` (list_manager -> list_columns +
 *   list_actions).
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const FormConstructorListPage = lazy(() => import('@/pages/v1/form/FormConstructorListPage'));
const FormBuilderPage = lazy(() => import('@/pages/v1/form/FormBuilderPage'));
const FormConstructorPage = lazy(() => import('@/pages/v1/form/FormConstructorPage'));
const FormRendererPage = lazy(() => import('@/pages/v1/form/FormRendererPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Cinco rotas, filhas de "/v1": quatro do construtor (`form-constructor`,
 * `.../create`, `.../update/:id` e a legada `form-constructor-claude`) mais o
 * renderer público `form/:slug`.
 *
 * `update/:id` usa o MESMO componente do create (`FormBuilderPage`): o que
 *   muda é a hidratação — em edição a árvore é preenchida com o registro
 *   existente. Se um dia as duas telas divergirem, o caminho é separar os
 *   componentes, não duplicar a rota.
 *
 * O `element` recebe o componente por lazy import.
 * -------------------------------------------------------------------------
 */
export const formRoutes: RouteObject[] = [
  { path: 'form-constructor', element: <FormConstructorListPage /> },
  { path: 'form-constructor/create', element: <FormBuilderPage /> },
  { path: 'form-constructor/update/:id', element: <FormBuilderPage /> },
  // Legado: construtor antigo (view_form_manager). NÃO MEXER nem remover sem
  // decidir a migração — ver regra 2 do header.
  { path: 'form-constructor-claude', element: <FormConstructorPage /> },
  { path: 'form/:slug', element: <FormRendererPage /> },
];

export default formRoutes;
