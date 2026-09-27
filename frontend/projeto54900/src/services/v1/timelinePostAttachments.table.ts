/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostAttachments.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo da tabela timeline_post_attachments — o
 * anexo de uma publicação (tabela própria e isolada do módulo Timeline, não
 * usa o módulo Upload). Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostAttachments/EndpointTable.php,
 * grupo api/v1/timeline-post-attachments ->
 * Api\V1\Timeline\TimelinePostAttachments\ResourceTableController.
 *
 * USADO SÓ PARA LEITURA por enquanto (`find` por `timeline_post_id`, para o
 * `MediaPreview` do card do feed) — a rota de upload do arquivo em si ainda
 * não está ligada no back-end (ver README_modulo_timeline.md seção 9, Fase
 * 3b: lacuna conhecida), então a criação de anexo não tem consumidor no
 * frontend ainda.
 *
 * DEPENDÊNCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.timelinePostAttachments).
 * CONSUMIDORES: pages/v1/timeline/home-feed/PostCard.tsx (find, para montar
 * o MediaPreview do post). Reexportado pelo barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instância do recurso — métodos REST padrão sobre timeline_post_attachments. */
export const timelinePostAttachmentsTable = createResource(API_GROUPS.timelinePostAttachments, 'v1');

export default timelinePostAttachmentsTable;
