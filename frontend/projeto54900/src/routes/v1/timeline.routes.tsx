/**
 * =========================================================================
 * FILE HEADER — routes/v1/timeline.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rota da listagem clássica do módulo Timeline (v1), path relativo
 * ao pai "/v1". Espelha `api/v1/timeline-posts-view` (+ `-view`) do backend
 * por baixo do motor genérico do Construtor de Listas (`list_manager` slug
 * `timeline-feed`) — ver `pages/v1/timeline/timeline-posts/GetAllPage.tsx`.
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   timeline       -> home-feed/GetAllPage   Home Feed (feed misto, scroll infinito, Fase 3b)
 *   timeline-posts -> timeline-posts/GetAllPage  listagem clássica (todas as publicações, Fase 2)
 *
 * NÃO tem create/update/:id aqui de propósito: criação de publicação usa o
 * renderizador genérico já registrado em `form.routes.tsx`
 * (`/v1/form/timeline-post`), e ainda não existe formulário de edição de post
 * nem página de detalhe no backend — ver LACUNA CONHECIDA abaixo.
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
 * DEPENDÊNCIAS: `pages/v1/timeline/timeline-posts/GetAllPage` (lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...timelineRoutes`; a navbar
 *   usa `paths.v1.timeline.list` (item de menu "Feed", `menu_manager.id=29`).
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `path` é RELATIVO ao pai "/v1" (sem barra inicial) — o prefixo vem do
 *      agregador `routes/v1/index.tsx`.
 *   2. `routes/paths.ts` é a fonte das URLs da aplicação — ao criar a página
 *      de detalhe/edição no futuro, registrar a rota aqui E a constante em
 *      `paths.ts` no mesmo commit.
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
const HomeFeedGetAllPage = lazy(() => import('@/pages/v1/timeline/home-feed/GetAllPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Uma rota, filha de "/v1": a listagem (path base). Sem create/update/:id —
 * ver header do arquivo.
 * -------------------------------------------------------------------------
 */
export const timelineRoutes: RouteObject[] = [
  { path: 'timeline', element: <HomeFeedGetAllPage /> },
  { path: 'timeline-posts', element: <TimelinePostsGetAllPage /> },
];

export default timelineRoutes;
