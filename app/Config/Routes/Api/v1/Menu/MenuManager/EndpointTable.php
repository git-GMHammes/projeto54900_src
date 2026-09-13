<?php
// Rotas REST para manipulacao da tabela menu_manager
// POST {{www}}/index.php/api/v1/menu-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Menu\MenuManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/menu-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Menu\MenuManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/menu-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Menu\MenuManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/menu-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/menu-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Menu\MenuManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/menu-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Menu\MenuManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/menu-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/menu-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/menu-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Menu\MenuManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/menu-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/menu-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Menu\MenuManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/menu-manager/create
$routes->post('create', 'Api\V1\Menu\MenuManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/menu-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/menu-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/menu-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/menu-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/menu-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Menu\MenuManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/menu-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Menu\MenuManager\ResourceTableController::clearDeleted/$1');
