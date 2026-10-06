<?php
// Rotas REST para manipulacao da tabela messages_manager
// Modulo Messages. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatMessages.
// POST {{www}}/index.php/api/v1/messages-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessagesManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/messages-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessagesManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/messages-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessagesManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/messages-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/messages-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessagesManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/messages-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessagesManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/messages-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/messages-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/messages-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessagesManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/messages-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/messages-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessagesManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/messages-manager/create
$routes->post('create', 'Api\V1\Messages\MessagesManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/messages-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/messages-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/messages-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/messages-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/messages-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessagesManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/messages-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
