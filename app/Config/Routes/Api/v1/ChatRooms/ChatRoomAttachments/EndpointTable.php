<?php
// Rotas REST para manipulacao da tabela chat_room_attachments
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota.
// O arquivo sobe pelo proprio POST create (multipart, campo `file`) e vai
// para writable/uploads/chat_messages/<chat_message_id>/; serve/download do
// binario ficam em EndpointUpload.php (mesmo grupo).
// POST {{www}}/index.php/api/v1/chat-room-attachments/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/chat-room-attachments/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/chat-room-attachments/create (multipart)
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-room-attachments/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-attachments/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/chat-room-attachments/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/chat-room-attachments/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachments/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachments/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
