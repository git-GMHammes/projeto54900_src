<?php
// Rotas REST para manipulacao da tabela chat_room_members
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As 3
// rotas de exclusao definitiva somam 'adminonly' na propria rota. A escrita
// (create/update/delete) e restrita pelo Processor ao dono da sala ou admin.
// POST {{www}}/index.php/api/v1/chat-room-members/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/chat-room-members/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-room-members/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/chat-room-members/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-members/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/chat-room-members/create
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-room-members/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-members/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/chat-room-members/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-members/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-members/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-members/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomMembers\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
