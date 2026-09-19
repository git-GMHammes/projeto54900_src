<?php
// Rotas REST para manipulacao da tabela list_columns
// POST {{www}}/index.php/api/v1/list-columns/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\List\ListColumns\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/list-columns/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\List\ListColumns\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/list-columns/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\List\ListColumns\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/list-columns/get/{id}
$routes->get('get/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/list-columns/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\List\ListColumns\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/list-columns/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\List\ListColumns\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/list-columns/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-columns/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-columns/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\List\ListColumns\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/list-columns/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-columns/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\List\ListColumns\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/list-columns/create
$routes->post('create', 'Api\V1\List\ListColumns\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/list-columns/update/{id}
$routes->put('update/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/list-columns/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/list-columns/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/list-columns/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/list-columns/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\List\ListColumns\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/list-columns/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\List\ListColumns\ResourceTableController::clearDeleted/$1');
