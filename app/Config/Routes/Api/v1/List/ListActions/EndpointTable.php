<?php
// Rotas REST para manipulacao da tabela list_actions
// POST {{www}}/index.php/api/v1/list-actions/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\List\ListActions\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/list-actions/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\List\ListActions\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/list-actions/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\List\ListActions\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/list-actions/get/{id}
$routes->get('get/(:num)', 'Api\V1\List\ListActions\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/list-actions/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\List\ListActions\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/list-actions/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\List\ListActions\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/list-actions/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\List\ListActions\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-actions/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\List\ListActions\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-actions/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\List\ListActions\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/list-actions/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\List\ListActions\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/list-actions/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\List\ListActions\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/list-actions/create
$routes->post('create', 'Api\V1\List\ListActions\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/list-actions/update/{id}
$routes->put('update/(:num)', 'Api\V1\List\ListActions\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/list-actions/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\List\ListActions\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/list-actions/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\List\ListActions\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/list-actions/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\List\ListActions\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/list-actions/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\List\ListActions\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/list-actions/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\List\ListActions\ResourceTableController::clearDeleted/$1');
