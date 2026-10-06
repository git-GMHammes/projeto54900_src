<?php
// Rotas REST para manipulacao da tabela message_groups_manager
// Modulo Messages. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota. Mesmo espelho de ChatRooms/ChatRoomsManager.
// POST {{www}}/index.php/api/v1/message-groups-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-groups-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-groups-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-groups-manager/create
$routes->post('create', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-groups-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-groups-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-groups-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-groups-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-groups-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-groups-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
