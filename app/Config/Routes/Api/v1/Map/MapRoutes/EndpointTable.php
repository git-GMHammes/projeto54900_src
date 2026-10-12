<?php
// Rotas REST para manipulacao da tabela map_routes
// Modulo Map — trajetos calculados (OpenRouteService). O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-routes/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapRoutes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-routes/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapRoutes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-routes/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapRoutes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-routes/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-routes/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapRoutes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-routes/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapRoutes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-routes/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-routes/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-routes/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapRoutes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-routes/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-routes/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapRoutes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-routes/create
$routes->post('create', 'Api\V1\Map\MapRoutes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-routes/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-routes/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-routes/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-routes/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-routes/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapRoutes\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-routes/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapRoutes\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
