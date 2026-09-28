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
 * USADO SÓ PARA LEITURA de metadados (`find` por `timeline_post_id`, para o
 * `MediaPreview` do card do feed). O ENVIO do arquivo (multipart) e a leitura
 * do binário (serve, como Blob) ficam em `timelinePostAttachments.upload.ts` —
 * o `create` daqui recebe JSON e não serve para anexo.
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
