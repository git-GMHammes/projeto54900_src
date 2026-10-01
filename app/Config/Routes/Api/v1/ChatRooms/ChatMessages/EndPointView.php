<?php
// Rotas REST para consulta da view view_chat_messages
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php. Mesmo
// espelho de ChatRoomsManager-view.
// POST {{www}}/index.php/api/v1/chat-messages-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/chat-messages-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-messages-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/chat-messages-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatMessages\ResourceViewController::getDeletedAll');
