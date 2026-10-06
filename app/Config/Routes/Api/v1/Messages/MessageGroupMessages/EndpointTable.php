<?php
// Rotas REST para manipulacao da tabela message_group_members
// Modulo Messages. Escopo no Processor.
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatRoomsManager.
// POST {{www}}/index.php/api/v1/message-group-messages/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-group-messages/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-group-messages/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-group-messages/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-group-messages/create
$routes->post('create', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-group-messages/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-group-messages/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-group-messages/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-group-messages/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-messages/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-messages/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
