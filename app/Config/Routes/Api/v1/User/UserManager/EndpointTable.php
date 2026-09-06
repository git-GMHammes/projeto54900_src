<?php
// Rotas REST para manipulação da tabela user_manager
// POST {{www}}/index.php/api/v1/user-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/user-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/user-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/user-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/user-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/user-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/user-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/user-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/user-manager/create
$routes->post('create', 'Api\V1\User\UserManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/user-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\User\UserManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/user-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/user-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/user-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/user-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\User\UserManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/user-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::clearDeleted/$1');
