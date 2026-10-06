<?php
// Rotas REST para manipulacao da tabela message_group_reads
// Modulo Messages. Escopo no Processor.
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatRoomsManager.
// POST {{www}}/index.php/api/v1/message-group-reads/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-group-reads/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-group-reads/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-group-reads/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-reads/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-group-reads/create
$routes->post('create', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-group-reads/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-group-reads/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-group-reads/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-group-reads/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-reads/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-group-reads/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageGroupReads\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
