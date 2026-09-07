// Espelho de: app/Config/Routes/Api/v1/Upload/UploadManager/EndpointUpload.php
// Grupo: api/v1/upload-manager  ->  Api\V1\Upload\UploadManager (endpoints de arquivo)
//
// Envio de arquivo via multipart/form-data. O http.ts detecta FormData e NAO
// forca Content-Type (o browser define o boundary).

import { http } from '@/services/http';
import { env } from '@/config/env';
import { API_GROUPS } from '@/constants/api';

const base = `/v1/${API_GROUPS.uploadManager}`;

export interface UploadArgs {
  file: File | Blob;
  fields?: Record<string, string>;
  /** Reservado para troca futura por XHR se precisar de barra de progresso real. */
  onProgress?: ((ratio: number) => void) | undefined;
  signal?: AbortSignal | undefined;
}

export interface UploadMultipleArgs {
  files: FileList | File[];
  fields?: Record<string, string>;
  signal?: AbortSignal | undefined;
}

// POST upload  (campo de arquivo: "file"; metadados opcionais no mesmo form)
export function upload({ file, fields = {}, onProgress, signal }: UploadArgs): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);

  // fetch nao expoe progresso de upload; onProgress fica reservado.
  void onProgress;
  return http.post(`${base}/upload`, form, signal ? { signal } : undefined);
}

// POST upload-multiple  (campo "files[]")
export function uploadMultiple({
  files,
  fields = {},
  signal,
}: UploadMultipleArgs): Promise<unknown> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append('files[]', f);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return http.post(`${base}/upload-multiple`, form, signal ? { signal } : undefined);
}

// GET download/{id}  -> URL absoluta para <a href> / window.open
export function downloadUrl(id: string | number): string {
  return `${env.apiBaseUrl}${base}/download/${id}`;
}

export const uploadManagerUpload = { upload, uploadMultiple, downloadUrl };
export default uploadManagerUpload;
