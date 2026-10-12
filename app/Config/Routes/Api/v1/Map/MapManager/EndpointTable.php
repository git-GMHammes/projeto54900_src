<?php
// Rotas REST para manipulacao da tabela map_manager
// Modulo Map — o mapa: centro, zoom e fonte de tiles. O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-manager/create
$routes->post('create', 'Api\V1\Map\MapManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
