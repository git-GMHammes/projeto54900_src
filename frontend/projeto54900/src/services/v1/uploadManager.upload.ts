/**
 * =========================================================================
 * FILE HEADER — services/v1/uploadManager.upload.ts
 * =========================================================================
 *
 * PROPOSITO: endpoints de ARQUIVO do modulo Upload (envio single/multiplo e
 * URL de download) — nao e um recurso REST padrao, por isso NAO usa
 * createResource. Espelho de
 * app/Config/Routes/Api/v1/Upload/UploadManager/EndpointUpload.php, grupo
 * api/v1/upload-manager -> Api\V1\Upload\UploadManager (endpoints de
 * arquivo). Para o CRUD do registro de metadados, ver
 * uploadManager.table.ts/uploadManager.view.ts.
 *
 * DEPENDENCIAS: services/http (http.post — detecta FormData e NAO forca
 * Content-Type, o browser define o boundary do multipart sozinho),
 * config/env (env.apiBaseUrl, para montar a URL absoluta de download) e
 * constants/api (API_GROUPS.uploadManager).
 * CONSUMIDORES: pages/v1/upload/UploadListPage.tsx e
 * pages/v1/upload/UploadViewPage.tsx (upload/download de anexos).
 * Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO COM ENVIO DE ARQUIVO: montar um
 * FormData, anexar o(s) arquivo(s) e campos extras, e chamar
 * `http.post(url, form)` — nao passar headers de Content-Type manualmente.
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { env } from '@/config/env';
import { API_GROUPS } from '@/constants/api';

const base = `/v1/${API_GROUPS.uploadManager}`;

/** Argumentos de upload({}): 1 arquivo + campos de metadados opcionais. */
export interface UploadArgs {
  file: File | Blob;
  fields?: Record<string, string>;
  /** Reservado para troca futura por XHR se precisar de barra de progresso real. */
  onProgress?: ((ratio: number) => void) | undefined;
  signal?: AbortSignal | undefined;
}

/** Argumentos de uploadMultiple({}): varios arquivos + campos de metadados opcionais. */
export interface UploadMultipleArgs {
  files: FileList | File[];
  fields?: Record<string, string>;
  signal?: AbortSignal | undefined;
}

/**
 * Envia 1 arquivo via multipart/form-data (campo "file"), junto com
 * metadados opcionais no mesmo form.
 * @param args ver UploadArgs; onProgress ainda nao tem efeito (fetch nao
 * expoe progresso de upload) — fica reservado para uma troca futura por XHR.
 * @returns corpo bruto da resposta (normalizar com utils/apiResult na chamada)
 */
export function upload({ file, fields = {}, onProgress, signal }: UploadArgs): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);

  // fetch nao expoe progresso de upload; onProgress fica reservado.
  void onProgress;
  return http.post(`${base}/upload`, form, signal ? { signal } : undefined);
}

/**
 * Envia varios arquivos de uma vez via multipart/form-data (campo
 * repetido "files[]").
 * @param args ver UploadMultipleArgs
 * @returns corpo bruto da resposta (normalizar com utils/apiResult na chamada)
 */
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

/**
 * Monta a URL absoluta de download de um upload — usar direto em
 * `<a href>` ou `window.open`, sem passar por http.ts (nao e uma chamada
 * fetch, e um link estatico).
 * @param id id do registro em upload_manager
 */
export function downloadUrl(id: string | number): string {
  return `${env.apiBaseUrl}${base}/download/${id}`;
}

/**
 * Monta a URL absoluta de visualizacao (inline no navegador) de um upload —
 * par de downloadUrl para `<a href target="_blank">`. Preferir a
 * `uploads.file_url`, que sai com o baseURL interno do backend (ex.:
 * localhost:8080) e pode nao ser alcancavel pelo navegador.
 * @param id id do registro em uploads
 */
export function serveUrl(id: string | number): string {
  return `${env.apiBaseUrl}${base}/serve/${id}`;
}

export const uploadManagerUpload = { upload, uploadMultiple, downloadUrl, serveUrl };
export default uploadManagerUpload;
