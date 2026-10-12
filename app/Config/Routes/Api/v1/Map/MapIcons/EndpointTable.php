<?php
// Rotas REST para manipulacao da tabela map_icons
// Modulo Map — icones de marcacao geografica (Bootstrap Icon, imagem ou SVG). O grupo inteiro exige sessao ativa ('jwtauth')
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/map-icons/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapIcons\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/map-icons/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapIcons\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-icons/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapIcons\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/map-icons/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/map-icons/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapIcons\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/map-icons/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapIcons\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-icons/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-icons/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-icons/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapIcons\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/map-icons/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-icons/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapIcons\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/map-icons/create
$routes->post('create', 'Api\V1\Map\MapIcons\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/map-icons/update/{id}
$routes->put('update/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/map-icons/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/map-icons/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/map-icons/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-icons/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Map\MapIcons\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/map-icons/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Map\MapIcons\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
