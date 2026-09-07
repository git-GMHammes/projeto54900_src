<?php
// Rotas REST para consulta da view view_upload_manager (contrato canonico, 10 linhas / 9 rotas).
// POST {{www}}/index.php/api/v1/upload-manager-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Upload\UploadManager\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/upload-manager-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Upload\UploadManager\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/upload-manager-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Upload\UploadManager\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Upload\UploadManager\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Upload\UploadManager\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Upload\UploadManager\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Upload\UploadManager\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Upload\UploadManager\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/upload-manager-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Upload\UploadManager\ResourceViewController::getDeletedAll');
