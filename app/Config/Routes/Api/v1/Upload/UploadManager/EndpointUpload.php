<?php
// Rotas especificas do modulo Upload (multipart + streaming de binario).
// NAO fazem parte do contrato canonico de 18 rotas — ver
// app/markdown/geral/README_modulo_upload.md (secao "Desvios sancionados").
//
// POST {{www}}/index.php/api/v1/upload-manager/upload
//   multipart/form-data: file (obrigatorio), module, reference_id, collection?, title?, description?
$routes->post('upload', 'Api\V1\Upload\UploadManager\ResourceTableController::upload');
// GET  {{www}}/index.php/api/v1/upload-manager/serve/{id}     -> binario inline
$routes->get('serve/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::serve/$1');
// GET  {{www}}/index.php/api/v1/upload-manager/download/{id}   -> binario como anexo
$routes->get('download/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::download/$1');
