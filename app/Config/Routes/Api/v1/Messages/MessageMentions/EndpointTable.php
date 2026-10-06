<?php
// Rotas REST para manipulacao da tabela message_mentions
// Modulo Messages. Escopo no Processor.
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatRoomsManager.
// POST {{www}}/index.php/api/v1/message-mentions/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageMentions\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-mentions/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageMentions\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-mentions/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageMentions\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-mentions/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-mentions/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageMentions\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-mentions/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageMentions\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-mentions/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-mentions/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-mentions/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageMentions\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-mentions/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-mentions/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageMentions\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-mentions/create
$routes->post('create', 'Api\V1\Messages\MessageMentions\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-mentions/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-mentions/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-mentions/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-mentions/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-mentions/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageMentions\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-mentions/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageMentions\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
