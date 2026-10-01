<?php
// Rotas REST para consulta da view view_chat_room_attachment_reports
// Modulo ChatRooms. 'jwtauth' por wildcard em Config/Filters.php e
// 'adminonly' rota a rota nas NOVE rotas: este objeto e a fila de moderacao
// de denuncias de anexo — so admin le. O filtro de rota roda depois do
// filtro de URI, com CurrentUser ja populado.
// POST {{www}}/index.php/api/v1/chat-room-attachment-reports-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getAllWithDeleted', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceViewController::getDeletedAll', ['filter' => 'adminonly']);
