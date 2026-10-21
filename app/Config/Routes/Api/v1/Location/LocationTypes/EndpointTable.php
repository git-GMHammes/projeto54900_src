<?php
// Rotas REST para manipulacao da tabela location_types
// Modulo Location — tipos de local (pais, rua, caixa, pasta...). O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/location-types/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Location\LocationTypes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/location-types/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Location\LocationTypes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/location-types/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Location\LocationTypes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/location-types/get/{id}
$routes->get('get/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/location-types/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Location\LocationTypes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/location-types/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Location\LocationTypes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/location-types/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/location-types/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/location-types/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Location\LocationTypes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/location-types/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/location-types/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Location\LocationTypes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/location-types/create
$routes->post('create', 'Api\V1\Location\LocationTypes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/location-types/update/{id}
$routes->put('update/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/location-types/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/location-types/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/location-types/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/location-types/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Location\LocationTypes\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/location-types/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Location\LocationTypes\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
