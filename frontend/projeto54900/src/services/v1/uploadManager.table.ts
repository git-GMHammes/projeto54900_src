/**
 * =========================================================================
 * FILE HEADER — services/v1/uploadManager.table.ts
 * =========================================================================
 *
 * PROPOSITO: recurso REST completo (create/update/delete + leitura) da
 * tabela upload_manager — os anexos polimorficos de outros modulos
 * (referenciam o registro dono por tabela/id genericos). Espelho de
 * app/Config/Routes/Api/v1/Upload/UploadManager/EndpointTable.php, grupo
 * api/v1/upload-manager -> Api\V1\Upload\UploadManager\ResourceTableController.
 * Para LEITURA agrupada, ver uploadManager.view.ts; para o ENVIO real do
 * arquivo (multipart), ver uploadManager.upload.ts.
 *
 * DEPENDENCIAS: services/resourceFactory (createResource) e constants/api
 * (API_GROUPS.uploadManager).
 * CONSUMIDORES: nenhum consumidor direto hoje alem do reexport pelo barrel
 * services/v1/index.ts — as telas de upload (UploadListPage/UploadViewPage)
 * usam uploadManagerView (leitura) e uploadManagerUpload (envio). Mantido
 * disponivel para quando uma tela precisar editar/excluir um registro
 * diretamente pela tabela.
 *
 * COMO REAPROVEITAR EM OUTRO MODULO: ver formCampos.table.ts (mesmo padrao
 * de recurso de tabela via createResource).
 * -------------------------------------------------------------------------
 */

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

/** Instancia do recurso — metodos REST padrao sobre upload_manager. */
export const uploadManagerTable = createResource(API_GROUPS.uploadManager, 'v1');

export default uploadManagerTable;
