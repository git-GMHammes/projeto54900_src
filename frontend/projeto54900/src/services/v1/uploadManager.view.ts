// Espelho de: app/Config/Routes/Api/v1/Upload/UploadManager/EndPointView.php
// Grupo: api/v1/upload-manager-view  ->  Api\V1\Upload\UploadManager\ResourceViewController
//
// View view_upload_manager (somente leitura).

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const uploadManagerView = createResource(API_GROUPS.uploadManagerView, 'v1', {
  mutations: false,
});

export default uploadManagerView;
