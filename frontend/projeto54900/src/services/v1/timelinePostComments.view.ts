/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostComments.view.ts
 * =========================================================================
 *
 * PROPOSITO: leitura da view view_timeline_post_comments — mesmos dados de
 * timeline_post_comments, já com o nome do autor (`uc_name`/`um_username`) e
 * o post/comentário-pai, sem precisar de outra chamada para exibir o
 * comentário na tela. Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostComments/EndPointView.php,
 * grupo api/v1/timeline-post-comments-view ->
 * Api\V1\Timeline\TimelinePostComments\ResourceViewController. Só leitura
 * (`mutations: false`) — escrita (criar comentário) usa timelinePostComments.table.ts.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.timelinePostCommentsView).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (find por
 * tc_timeline_post_id, para os 3 comentários mais recentes + "ver mais", id DESC).
 * Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — leitura de view_timeline_post_comments (sem escrita). */
export const timelinePostCommentsView = createResource(API_GROUPS.timelinePostCommentsView, 'v1', {
  mutations: false,
});

export default timelinePostCommentsView;
