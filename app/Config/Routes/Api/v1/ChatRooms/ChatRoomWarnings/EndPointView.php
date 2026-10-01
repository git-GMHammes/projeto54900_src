<?php
// Rotas REST para consulta da view view_chat_room_warnings
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php e
// 'adminonly' rota a rota nas NOVE rotas — registro de moderacao, so admin
// le.
// POST {{www}}/index.php/api/v1/chat-room-warnings-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-warnings-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getAllWithDeleted', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-warnings-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomWarnings\ResourceViewController::getDeletedAll', ['filter' => 'adminonly']);
