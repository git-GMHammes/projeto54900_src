<?php
// Rotas REST para manipulacao da tabela chat_room_favorites
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As 3
// rotas de exclusao definitiva somam 'adminonly' na propria rota. Mesmo
// espelho de ChatRoomsManager/ChatMessages — dado pessoal do proprio
// usuario, nao e fila de moderacao (diferente de ChatRoomAttachmentReports/
// ChatRoomWarnings).
// POST {{www}}/index.php/api/v1/chat-room-favorites/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/chat-room-favorites/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/chat-room-favorites/create
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-room-favorites/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-favorites/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/chat-room-favorites/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-favorites/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-favorites/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-favorites/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
