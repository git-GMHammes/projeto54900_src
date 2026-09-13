<?php
// Rotas REST para manipulacao da tabela nav_manager
// POST {{www}}/index.php/api/v1/nav-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Nav\NavManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/nav-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Nav\NavManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/nav-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Nav\NavManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/nav-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/nav-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Nav\NavManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/nav-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Nav\NavManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/nav-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/nav-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/nav-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Nav\NavManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/nav-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/nav-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Nav\NavManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/nav-manager/create
$routes->post('create', 'Api\V1\Nav\NavManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/nav-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/nav-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/nav-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/nav-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/nav-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Nav\NavManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/nav-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Nav\NavManager\ResourceTableController::clearDeleted/$1');
