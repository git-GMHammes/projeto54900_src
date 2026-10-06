<?php
// Rotas REST para manipulacao da tabela message_group_members
// Modulo Messages. Escopo no Processor.
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatRoomsManager.
// POST {{www}}/index.php/api/v1/message-group-members/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-group-members/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-group-members/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-group-members/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-group-members/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-group-members/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-group-members/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-members/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-members/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-group-members/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-members/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-group-members/create
$routes->post('create', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-group-members/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-group-members/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-group-members/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-group-members/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-members/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-members/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
