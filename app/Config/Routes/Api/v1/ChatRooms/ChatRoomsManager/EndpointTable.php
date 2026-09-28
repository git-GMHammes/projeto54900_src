<?php
// Rotas REST para manipulacao da tabela chat_rooms_manager
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica (guest nao
// entra em sala nenhuma, ver Processor). As 3 rotas de exclusao definitiva
// somam 'adminonly' na propria rota: o filtro de rota roda depois do filtro
// de URI, com CurrentUser ja populado. Mesmo espelho de TimelineManager.
// POST {{www}}/index.php/api/v1/chat-rooms-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/chat-rooms-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/chat-rooms-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/chat-rooms-manager/create
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-rooms-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/chat-rooms-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/chat-rooms-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/chat-rooms-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-rooms-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-rooms-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
