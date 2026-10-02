// PROPOSITO: endpoints de ARQUIVO do anexo do chat — envio do binario
// (multipart no proprio `POST create`) e leitura do binario autenticado
// (`GET serve/{id}` inline e `GET download/{id}` como anexo, ambos `Blob`).
// Nao e recurso REST padrao, por isso NAO usa createResource. Espelho de
// app/Config/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndpointUpload.php
// (serve/download) + o `create` multipart de EndpointTable.php, grupo
// api/v1/chat-room-attachments. Mesmo desenho de timelinePostAttachments.upload.ts.
//
// POR QUE `Blob` E NAO UMA URL: o grupo esta sob `jwtauth`, que so le o
// cabecalho `Authorization`; `<a href>`/`<img src>` nao mandam (daria 401).
//
// REGRA DO BACKEND: so o autor da mensagem (ou admin) anexa arquivo.

import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';

const base = `/v1/${API_GROUPS.chatRoomAttachments}`;

/** Argumentos de upload({}): o arquivo + a mensagem dona (+ categoria opcional; o backend infere se omitida). */
export interface ChatRoomAttachmentUploadArgs {
  file: File;
  chatMessageId: number | string;
  category?: string | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * Envia o anexo de uma mensagem via multipart/form-data (campo "file" +
 * `chat_message_id`) para o `POST create` do grupo.
 * @returns corpo bruto da resposta (normalizar com utils/apiResult na chamada)
 */
export function upload({ file, chatMessageId, category, signal }: ChatRoomAttachmentUploadArgs): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  form.append('chat_message_id', String(chatMessageId));
  if (category) form.append('category', category);
  return http.post(`${base}/create`, form, signal ? { signal } : undefined);
}

/**
 * Baixa o binario do anexo como download (`download/{id}`) com o token da sessao.
 * @param id id em chat_room_attachments
 */
export function fetchDownload(id: number | string, signal?: AbortSignal): Promise<Blob> {
  return http.get<Blob>(`${base}/download/${id}`, { responseType: 'blob', signal });
}

export const chatRoomAttachmentsUpload = { upload, fetchDownload };
export default chatRoomAttachmentsUpload;
