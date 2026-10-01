<?php
// Rotas REST para manipulacao da tabela chat_room_warnings
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. TODAS as 18 rotas somam 'adminonly' na
// propria rota — nao ha "autor" de uma advertencia, e registro de moderacao
// sobre outro usuario (revela a palavra proibida usada). A criacao
// automatica pelo filtro de palavrao (README §4.5) e integracao futura de
// ChatMessages, quando o dicionario JSON existir — nao passa por aqui.
// POST {{www}}/index.php/api/v1/chat-room-warnings/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-warnings/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getDeletedAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::getAllWithDeleted', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-warnings/create
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/chat-room-warnings/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-warnings/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/chat-room-warnings/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-warnings/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-warnings/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-warnings/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
