<?php
// Rotas REST para manipulacao da tabela service_attributes
// Modulo Service — caracteristicas do servico. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/service-attributes/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Service\ServiceAttributes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/service-attributes/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/service-attributes/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Service\ServiceAttributes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/service-attributes/get/{id}
$routes->get('get/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/service-attributes/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/service-attributes/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/service-attributes/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-attributes/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-attributes/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/service-attributes/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-attributes/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Service\ServiceAttributes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/service-attributes/create
$routes->post('create', 'Api\V1\Service\ServiceAttributes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/service-attributes/update/{id}
$routes->put('update/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/service-attributes/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/service-attributes/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/service-attributes/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/service-attributes/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Service\ServiceAttributes\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/service-attributes/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Service\ServiceAttributes\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
