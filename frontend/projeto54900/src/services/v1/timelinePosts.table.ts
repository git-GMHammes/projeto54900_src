/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePosts.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (leitura + escrita + soft/hard delete) da
 * tabela timeline_posts (a publicação — texto e, opcionalmente, republicação
 * via `repost_of_id`) + `getHomeFeed`, endpoint EXTRA (fora do endpoint-set
 * padrão da factory) sobre a VIEW `view_timeline_posts`, não sobre esta
 * tabela: o feed misto da Home Feed. Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePosts/{EndpointTable,EndPointView}.php,
 * grupos `api/v1/timeline-posts` (CRUD) e `api/v1/timeline-posts-view/home-feed`
 * (feed misto) -> `Api\V1\Timeline\TimelinePosts\ResourceViewController::homeFeed`.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource), services/http
 * (chamada crua do endpoint extra) e constants/api (API_GROUPS.timelinePosts,
 * .timelinePostsView).
 * CONSUMIDORES: pages/v1/timeline/home-feed/GetAllPage.tsx (getHomeFeed, para
 * a listagem paginada) e NewPostModal.tsx/PostCard.tsx (create, para novo
 * post e republicação). Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MÓDULO COM ENDPOINT EXTRA: ver
 * calendarEventAttendees.table.ts (`respondToEvent`) — mesmo padrão: função
 * solta, ao lado do `createResource`, chamando `http` direto com o path
 * montado a partir de `API_GROUPS`.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_posts. */
export const timelinePostsTable = createResource(API_GROUPS.timelinePosts, 'v1');

/**
 * GET timeline-posts-view/home-feed?seed=&page=&limit= — feed misto da Home
 * Feed (posts de hoje + de outros usuários, aleatório seedado; mais
 * curtidos; mais bem avaliados). `seed` deve ser gerado UMA vez pelo
 * consumidor (ao abrir a tela) e reenviado em toda página seguinte — é o que
 * dá paginação estável e sem repetição no scroll infinito. Ver
 * `README_modulo_timeline.md` seção 5.1 (backend) para o algoritmo completo.
 */
export function getHomeFeed(seed: number, page: number, limit = 10): Promise<unknown> {
  return http.get(`/${DEFAULT_API_VERSION}/${API_GROUPS.timelinePostsView}/home-feed`, {
    params: { seed, page, limit },
  });
}

/**
 * GET timeline-posts-view/get/{id} — uma linha da view (mesmo formato do
 * home-feed, sem `my_reaction_id`/`my_rating`). Usado pela Home Feed para
 * fixar no topo o post que o usuário acabou de publicar (a view é escopada ao
 * usuário do JWT — o próprio post sempre é visível).
 */
export function getFeedPost(id: number): Promise<unknown> {
  return http.get(`/${DEFAULT_API_VERSION}/${API_GROUPS.timelinePostsView}/get/${id}`);
}

export default timelinePostsTable;
