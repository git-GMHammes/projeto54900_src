<?php
// Rotas REST para manipulacao da tabela chat_messages
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRoomsManager.
// POST {{www}}/index.php/api/v1/chat-messages/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/chat-messages/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-messages/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/chat-messages/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-messages/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/chat-messages/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-messages/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-messages/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-messages/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/chat-messages/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-messages/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/chat-messages/create
$routes->post('create', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-messages/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/chat-messages/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/chat-messages/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/chat-messages/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-messages/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-messages/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
