<?php
// Rotas REST para manipulacao da tabela map_categories
// Modulo Map — categoria de ponto, por mapa. O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-categories/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapCategories\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-categories/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapCategories\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-categories/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapCategories\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-categories/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-categories/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapCategories\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-categories/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapCategories\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-categories/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-categories/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-categories/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapCategories\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-categories/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-categories/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapCategories\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-categories/create
$routes->post('create', 'Api\V1\Map\MapCategories\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-categories/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-categories/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-categories/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-categories/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-categories/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapCategories\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-categories/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapCategories\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
