<?php
// Rotas REST para manipulacao da tabela uploads (contrato canonico, 18 rotas).
// POST {{www}}/index.php/api/v1/upload-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Upload\UploadManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/upload-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Upload\UploadManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/upload-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Upload\UploadManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/upload-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/upload-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Upload\UploadManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/upload-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Upload\UploadManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/upload-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/upload-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/upload-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Upload\UploadManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/upload-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/upload-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Upload\UploadManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/upload-manager/create
$routes->post('create', 'Api\V1\Upload\UploadManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/upload-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/upload-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/upload-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/upload-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/upload-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Upload\UploadManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/upload-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Upload\UploadManager\ResourceTableController::clearDeleted/$1');
