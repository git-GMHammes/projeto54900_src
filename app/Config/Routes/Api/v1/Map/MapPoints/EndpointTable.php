<?php
// Rotas REST para manipulacao da tabela map_points
// Modulo Map — pontos no mapa. O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-points/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapPoints\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-points/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapPoints\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-points/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapPoints\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-points/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-points/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapPoints\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-points/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapPoints\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-points/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-points/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-points/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapPoints\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-points/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-points/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapPoints\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-points/create
$routes->post('create', 'Api\V1\Map\MapPoints\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-points/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-points/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-points/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-points/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-points/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapPoints\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-points/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapPoints\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
