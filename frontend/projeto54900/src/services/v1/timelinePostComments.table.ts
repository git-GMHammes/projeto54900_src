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
 * CONSUMIDORES: nenhum na Home Feed desde 2026-09-28 — a leitura usa
 * timelinePostComments.view.ts (PostCard) e o envio vai pelo submit do form
 * `timeline-comment` (NewCommentModal). Mantido para o CRUD da tabela.
 * Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_post_comments. */
export const timelinePostCommentsTable = createResource(API_GROUPS.timelinePostComments, 'v1');

export default timelinePostCommentsTable;
