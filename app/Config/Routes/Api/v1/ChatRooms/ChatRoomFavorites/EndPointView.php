<?php
// Rotas REST para consulta da view view_chat_room_favorites
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/chat-room-favorites-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/chat-room-favorites-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/chat-room-favorites-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceViewController::getDeletedAll');
