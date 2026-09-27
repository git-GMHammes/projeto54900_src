/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostComments.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo da tabela timeline_post_comments — o
 * comentário de uma publicação, com resposta opcional via `parent_id`.
 * Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostComments/EndpointTable.php,
 * grupo api/v1/timeline-post-comments ->
 * Api\V1\Timeline\TimelinePostComments\ResourceTableController.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.timelinePostComments).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (find por
 * timeline_post_id, para os 3 primeiros + "ver mais"; create, para comentar).
 * Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_post_comments. */
export const timelinePostCommentsTable = createResource(API_GROUPS.timelinePostComments, 'v1');

export default timelinePostCommentsTable;
