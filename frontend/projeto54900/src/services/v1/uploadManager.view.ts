/**
 * =========================================================================
 * FILE HEADER — services/v1/uploadManager.view.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST SOMENTE LEITURA (`mutations: false`) sobre a view
 * view_upload_manager. Espelho de
 * app/Config/Routes/Api/v1/Upload/UploadManager/EndPointView.php, grupo
 * api/v1/upload-manager-view -> Api\V1\Upload\UploadManager\ResourceViewController.
 * Para ESCRITA no registro, ver uploadManager.table.ts; para o ENVIO do
 * arquivo em si (multipart), ver uploadManager.upload.ts.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource, aqui com
 * `{ mutations: false }`) e constants/api (API_GROUPS.uploadManagerView).
 * CONSUMIDORES: pages/v1/upload/UploadViewPage.tsx (detalhe de um upload).
 * Reexportado pelo barrel services/v1/index.ts.
 *
 * COMO REAPROVEITAR EM OUTRA VIEW SOMENTE LEITURA: chamar
 * `createResource(API_GROUPS.<view>, 'v1', { mutations: false })` — ver
 * tambem formManager.view.ts e userManager.view.ts.
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — so metodos de leitura (list/get) sobre view_upload_manager. */
export const uploadManagerView = createResource(API_GROUPS.uploadManagerView, 'v1', {
  mutations: false,
});

export default uploadManagerView;
