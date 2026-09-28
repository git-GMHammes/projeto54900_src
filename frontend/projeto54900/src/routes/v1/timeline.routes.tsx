/**
 * =========================================================================
 * FILE HEADER — routes/v1/timeline.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Timeline (v1), paths relativos ao pai "/v1".
 * Duas telas de feed (espelham `api/v1/timeline-posts-view`) mais as CINCO
 * listas padrão dos recursos do módulo, dirigidas pelo motor genérico do
 * Construtor de Listas (`list_manager`/`list_columns`).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   timeline            -> home-feed/GetAllPage      Home Feed (feed misto, scroll infinito, Fase 3b)
 *   timeline-posts      -> timeline-posts/GetAllPage  listagem clássica (todas as publicações, Fase 2), slug `timeline-feed`
 *   timeline-post       -> timeline-post/GetAllPage   lista padrão das publicações      (slug `timeline-post`)
 *   timeline-manager    -> timeline-manager/GetAllPage lista padrão das timelines        (slug `timeline-manager`)
 *   timeline-comment    -> timeline-comment/GetAllPage lista padrão dos comentários      (slug `timeline-comment`)
 *   timeline-report     -> timeline-report/GetAllPage  lista padrão das denúncias         (slug `timeline-report`)
 *   timeline-attachment -> timeline-attachment/GetAllPage lista padrão dos anexos de post (slug `timeline-attachment`)
 *
 * AS 5 LISTAS PADRÃO (2026-09-28): antes os itens de menu do módulo apontavam
 * para o renderizador genérico de formulário (`/v1/form/timeline-post`,
 * `/v1/form/timeline-settings`, …). Passaram a apontar para rotas do próprio
 * módulo, e essas rotas exibem LISTA (não formulário): cada página é um wrapper
 * fino de `pages/v1/timeline/StandardListPage.tsx`, e TODO o conteúdo (título,
 * endpoint, colunas, ordenação padrão, limites, busca) vem do registro
 * homônimo em `list_manager` — criar/ajustar em `/v1/list-constructor`.
 * O renderizador `/v1/form/<slug>` CONTINUA existindo e funcionando para quem
 * já aponta para lá (não foi removido).
 *
 * NÃO tem create/update/:id aqui de propósito: continua sem formulário de
 * edição de post e sem página de detalhe — ver LACUNA CONHECIDA abaixo.
 *
 * LACUNA CONHECIDA (documentada em `README_rotas_frontend.md`, NÃO corrigida
 *   aqui, mesmo padrão de `upload.routes.tsx`): os `list_actions` "Ver"
 *   (`/v1/timeline-posts/{id}`), "Comentar"
 *   (`/v1/timeline-post-comments?timeline_post_id={id}`) e "Editar"
 *   (`/v1/timeline-posts/update/{id}`) apontam para rotas que não existem
 *   nesta lista — clicar neles hoje cai no `NotFoundPage`. Ficam para quando
 *   a página de detalhe/comentários e o formulário de edição de post
 *   existirem.
 *
 * DEPENDÊNCIAS: `pages/v1/timeline/home-feed/GetAllPage`,
 *   `pages/v1/timeline/timeline-posts/GetAllPage` e as 5 listas padrão
 *   (`timeline-{post,manager,comment,report,attachment}/GetAllPage`, todas
 *   wrappers de `pages/v1/timeline/StandardListPage`) — lazy imports.
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...timelineRoutes`; a navbar usa
 *   `paths.v1.timeline.*` (itens de menu do módulo: "Início" id 30, "Feed" id 29
 *   e os 5 filhos de listagem, `menu_manager.react_route`).
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `path` é RELATIVO ao pai "/v1" (sem barra inicial) — o prefixo vem do
 *      agregador `routes/v1/index.tsx`.
 *   2. `routes/paths.ts` é a fonte das URLs da aplicação — ao criar a página
 *      de detalhe/edição no futuro, registrar a rota aqui E a constante em
 *      `paths.ts` no mesmo commit.
 *   3. `timeline-post` (lista padrão, singular) e `timeline-posts` (listagem
 *      clássica do feed) são rotas DIFERENTES de propósito — não unificar sem
 *      alinhar com o item de menu correspondente.
 *   4. Rota nova de lista padrão: criar a pasta
 *      `pages/v1/timeline/<recurso>/GetAllPage.tsx` (wrapper de
 *      `StandardListPage`), registrar aqui e criar o registro do slug em
 *      `list_manager` (`/v1/list-constructor`), senão a tela aparece vazia.
 *
 * COMO ESTENDER (quando a página de detalhe/edição existir):
 *   1. criar a página em `pages/v1/timeline/timeline-posts/<Acao>Page.tsx`;
 *   2. acrescentar a rota aqui (`timeline-posts/:id`, `timeline-posts/update/:id`);
 *   3. criar a URL em `routes/paths.ts` e trocar o `href_template` da ação
 *      correspondente em `list_actions` (banco), removendo a nota de lacuna.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const TimelinePostsGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-posts/GetAllPage'));
const TimelinePostsGetAllAdminPage = lazy(() => import('@/pages/v1/timeline/timeline-posts-get-all/GetAllPage'));
const HomeFeedGetAllPage = lazy(() => import('@/pages/v1/timeline/home-feed/GetAllPage'));
const TimelinePostGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-post/GetAllPage'));
const TimelineManagerGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-manager/GetAllPage'));
const TimelineCommentGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-comment/GetAllPage'));
const TimelineReportGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-report/GetAllPage'));
const TimelineAttachmentGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-attachment/GetAllPage'));
const TimelineReactionGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-reaction/GetAllPage'));
const TimelineRatingGetAllPage = lazy(() => import('@/pages/v1/timeline/timeline-rating/GetAllPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Sete rotas, filhas de "/v1": as duas telas de feed (`timeline`,
 * `timeline-posts`) e as cinco listas padrão por recurso. Sem
 * create/update/:id — ver header do arquivo.
 *
 * O `element` recebe o componente por lazy import: o código de cada página é
 * baixado só quando visitada.
 * -------------------------------------------------------------------------
 */
export const timelineRoutes: RouteObject[] = [
  { path: 'timeline', element: <HomeFeedGetAllPage /> },
  { path: 'timeline-posts', element: <TimelinePostsGetAllPage /> },
  // Variante admin da listagem clássica: get-all simples, sem restrição a "só meus posts" (slug `timeline-posts-get-all`).
  { path: 'timeline-posts-get-all', element: <TimelinePostsGetAllAdminPage /> },
  // Listas padrão (motor do Construtor de Listas) — substituem, nos itens de
  // menu do módulo, o antigo renderizador genérico `/v1/form/<slug>`.
  { path: 'timeline-post', element: <TimelinePostGetAllPage /> },
  { path: 'timeline-manager', element: <TimelineManagerGetAllPage /> },
  { path: 'timeline-comment', element: <TimelineCommentGetAllPage /> },
  { path: 'timeline-report', element: <TimelineReportGetAllPage /> },
  { path: 'timeline-attachment', element: <TimelineAttachmentGetAllPage /> },
  { path: 'timeline-reaction', element: <TimelineReactionGetAllPage /> },
  { path: 'timeline-rating', element: <TimelineRatingGetAllPage /> },
];

export default timelineRoutes;
