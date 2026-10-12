<?php
// Rotas REST para manipulacao da tabela do modulo User\UserResourceAccess (user-resource-access)
// POST {{www}}/index.php/api/v1/user-resource-access/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserResourceAccess\ResourceTableController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/user-resource-access/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserResourceAccess\ResourceTableController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserResourceAccess\ResourceTableController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserResourceAccess\ResourceTableController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserResourceAccess\ResourceTableController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::getWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserResourceAccess\ResourceTableController::getDeletedAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserResourceAccess\ResourceTableController::getAllWithDeleted', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/user-resource-access/create
$routes->post('create', 'Api\V1\User\UserResourceAccess\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/user-resource-access/update/{id}
$routes->put('update/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/user-resource-access/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/user-resource-access/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/user-resource-access/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/user-resource-access/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\User\UserResourceAccess\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/user-resource-access/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\User\UserResourceAccess\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
