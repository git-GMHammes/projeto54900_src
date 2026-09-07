// Espelho de: app/Config/Routes/Api/v1/Upload/UploadManager/EndpointTable.php
// Grupo: api/v1/upload-manager  ->  Api\V1\Upload\UploadManager\ResourceTableController
//
// Tabela upload_manager (anexos polimorficos de outros modulos).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const uploadManagerTable = createResource(API_GROUPS.uploadManager, 'v1');

export default uploadManagerTable;
