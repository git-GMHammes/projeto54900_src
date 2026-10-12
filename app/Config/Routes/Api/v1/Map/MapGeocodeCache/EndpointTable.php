<?php
// Rotas REST para manipulacao da tabela map_geocode_cache
// Modulo Map — cache de geocodificacao (politica do Nominatim exige cache). O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-geocode-cache/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-geocode-cache/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-geocode-cache/create
$routes->post('create', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-geocode-cache/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-geocode-cache/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-geocode-cache/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-geocode-cache/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-geocode-cache/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-geocode-cache/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
