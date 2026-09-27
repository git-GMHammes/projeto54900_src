/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostRatings.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo da tabela timeline_post_ratings —
 * avaliação por estrela (1..5) de uma publicação (uma nota por
 * usuário/post; `create` funciona como upsert no back-end quando já existe
 * linha do mesmo par). Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostRatings/EndpointTable.php,
 * grupo api/v1/timeline-post-ratings ->
 * Api\V1\Timeline\TimelinePostRatings\ResourceTableController.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.timelinePostRatings).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (create, para
 * avaliar). Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_post_ratings. */
export const timelinePostRatingsTable = createResource(API_GROUPS.timelinePostRatings, 'v1');

export default timelinePostRatingsTable;
