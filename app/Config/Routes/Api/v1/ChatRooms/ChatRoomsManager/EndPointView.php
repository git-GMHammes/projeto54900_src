<?php
// Rotas REST para consulta da view view_chat_rooms_manager
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php; leitura nao
// e restrita ao dono — qualquer usuario autenticado (exceto guest) enxerga
// qualquer sala, e a listagem/contadores da sala nao expoem nenhuma coluna
// sensivel. Mesmo espelho de TimelineManager-view.
// POST {{www}}/index.php/api/v1/chat-rooms-manager-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/chat-rooms-manager-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceViewController::getDeletedAll');
