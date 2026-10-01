<?php
// Rotas REST para consulta da view view_chat_room_attachments
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/chat-room-attachments-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/chat-room-attachments-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/chat-room-attachments-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceViewController::getDeletedAll');
