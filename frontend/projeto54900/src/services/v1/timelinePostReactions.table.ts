/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostReactions.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo da tabela timeline_post_reactions —
 * like/dislike de uma publicação (uma reação por usuário/post; `create`
 * funciona como upsert no back-end quando já existe linha do mesmo par).
 * Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostReactions/EndpointTable.php,
 * grupo api/v1/timeline-post-reactions ->
 * Api\V1\Timeline\TimelinePostReactions\ResourceTableController.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.timelinePostReactions).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (create, para
 * curtir). Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_post_reactions. */
export const timelinePostReactionsTable = createResource(API_GROUPS.timelinePostReactions, 'v1');

export default timelinePostReactionsTable;
