<?php
// Rotas REST para manipulacao da tabela message_warnings
// Modulo Messages. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. TODAS as 18 rotas somam 'adminonly' na
// propria rota — nao ha "autor" de uma advertencia, e registro de moderacao
// sobre outro usuario (revela a palavra proibida usada). A criacao
// AUTOMATICA (filtro de palavrao, AppLibrariesForbiddenWords) grava direto
// pelo model quando uma mensagem e recusada — nao passa por aqui.
// POST {{www}}/index.php/api/v1/message-warnings/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/message-warnings/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getDeletedAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/message-warnings/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::getAllWithDeleted', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/message-warnings/create
$routes->post('create', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/message-warnings/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-warnings/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/message-warnings/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-warnings/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-warnings/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-warnings/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\MessageWarnings\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
