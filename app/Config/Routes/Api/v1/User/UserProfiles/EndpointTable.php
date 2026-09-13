<?php
// Rotas REST para manipulação da tabela user_profiles
// POST {{www}}/index.php/api/v1/user-profiles/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserProfiles\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/user-profiles/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserProfiles\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/user-profiles/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserProfiles\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/user-profiles/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/user-profiles/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserProfiles\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/user-profiles/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserProfiles\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/user-profiles/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-profiles/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-profiles/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserProfiles\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/user-profiles/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-profiles/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/user-profiles/create
$routes->post('create', 'Api\V1\User\UserProfiles\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/user-profiles/update/{id}
$routes->put('update/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/user-profiles/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/user-profiles/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/user-profiles/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/user-profiles/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\User\UserProfiles\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/user-profiles/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::clearDeleted/$1');
