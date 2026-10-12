<?php
// Rotas REST para manipulacao da tabela map_postal_codes
// Modulo Map — base de CEP (logradouro, bairro, cidade) com coordenada. O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-postal-codes/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapPostalCodes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-postal-codes/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-postal-codes/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapPostalCodes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-postal-codes/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapPostalCodes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-postal-codes/create
$routes->post('create', 'Api\V1\Map\MapPostalCodes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-postal-codes/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-postal-codes/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-postal-codes/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-postal-codes/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-postal-codes/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapPostalCodes\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-postal-codes/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapPostalCodes\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
