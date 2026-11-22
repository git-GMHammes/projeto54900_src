<?php
// Rotas REST para manipulacao da tabela sgd_document_types
// POST {{www}}/index.php/api/v1/sgd-document-types/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/sgd-document-types/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/sgd-document-types/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get/{id}
$routes->get('get/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/sgd-document-types/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/sgd-document-types/create
$routes->post('create', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/sgd-document-types/update/{id}
$routes->put('update/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/sgd-document-types/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/sgd-document-types/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/sgd-document-types/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/sgd-document-types/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/sgd-document-types/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Sgd\DocumentTypes\ResourceTableController::clearDeleted/$1');
