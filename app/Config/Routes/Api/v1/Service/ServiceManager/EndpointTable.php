<?php
// Rotas REST para manipulacao da tabela service_manager
// Modulo Service — catalogo de servicos. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/service-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Service\ServiceManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/service-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Service\ServiceManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/service-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Service\ServiceManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/service-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/service-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Service\ServiceManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/service-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Service\ServiceManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/service-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Service\ServiceManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/service-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Service\ServiceManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/service-manager/create
$routes->post('create', 'Api\V1\Service\ServiceManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/service-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/service-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/service-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/service-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/service-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Service\ServiceManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/service-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Service\ServiceManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
