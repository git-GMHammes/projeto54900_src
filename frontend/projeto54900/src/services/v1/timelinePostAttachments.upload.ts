/**
 * =========================================================================
 * FILE HEADER — services/v1/timelinePostAttachments.upload.ts
 * =========================================================================
 *
 * PROPOSITO: endpoints de ARQUIVO do anexo da Timeline — envio do binário
 * (multipart no próprio `POST create`) e leitura do binário autenticado
 * (`GET serve/{id}` como `Blob`). Não é recurso REST padrão, por isso NÃO usa
 * createResource. Espelho de
 * app/Config/Routes/Api/v1/Timeline/TimelinePostAttachments/EndpointUpload.php
 * (serve/download) + o `create` multipart de EndpointTable.php, grupo
 * api/v1/timeline-post-attachments. Backend EXCLUSIVO da Timeline
 * (tabela `timeline_post_attachments`) — não usa o módulo Upload.
 *
 * POR QUE `fetchBlob` E NÃO UMA URL: o grupo está sob `jwtauth`, que só lê
 * o cabeçalho `Authorization`. `<img src>`/`<video src>`/`<a href>` não mandam
 * esse cabeçalho (daria 401) — então o binário vem por `http.get` com
 * `responseType: 'blob'` e a tela monta um `blob:` URL
 * (`URL.createObjectURL`), liberando com `URL.revokeObjectURL` ao desmontar.
 *
 * REGRA DO BACKEND: 1 anexo por publicação — um segundo `upload` para o
 * mesmo post responde 409.
 *
 * DEPENDENCIAS: services/http (http.post com FormData, http.get com
 * responseType 'blob') e constants/api (API_GROUPS.timelinePostAttachments).
 * CONSUMIDORES: pages/v1/timeline/home-feed/NewPostModal.tsx (upload) e
 * pages/v1/timeline/home-feed/PostCard.tsx (fetchBlob). Reexportado pelo
 * barrel services/v1/index.ts.
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';

const base = `/v1/${API_GROUPS.timelinePostAttachments}`;

/** Argumentos de upload({}): o arquivo + a publicação dona. */
export interface TimelineAttachmentUploadArgs {
  file: File;
  timelinePostId: number | string;
  signal?: AbortSignal | undefined;
}

/**
 * Envia O anexo de uma publicação via multipart/form-data (campo "file" +
 * `timeline_post_id`) para o `POST create` do grupo.
 * @returns corpo bruto da resposta (normalizar com utils/apiResult na chamada)
 */
export function upload({ file, timelinePostId, signal }: TimelineAttachmentUploadArgs): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  form.append('timeline_post_id', String(timelinePostId));
  return http.post(`${base}/create`, form, signal ? { signal } : undefined);
}

/**
 * Baixa o binário do anexo (inline, `serve/{id}`) com o token da sessão.
 * @param id id em timeline_post_attachments
 */
export function fetchBlob(id: number | string, signal?: AbortSignal): Promise<Blob> {
  return http.get<Blob>(`${base}/serve/${id}`, { responseType: 'blob', signal });
}

export const timelinePostAttachmentsUpload = { upload, fetchBlob };
export default timelinePostAttachmentsUpload;
