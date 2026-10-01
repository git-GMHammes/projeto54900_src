<?php
// Rotas REST para manipulacao da tabela chat_room_attachment_reports
// Modulo ChatRooms. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica.
// ESTE e o grupo da fila de moderacao: 'create' (denunciar) e do usuario
// logado comum (nao-guest); TODAS as outras rotas somam 'adminonly' na
// propria rota, porque leem ou alteram denuncias de terceiros (status,
// reviewed_by, reviewed_at, review_note, alem das exclusoes definitivas).
// O create ja dispara o bloqueio imediato do anexo e da matricula do autor
// do upload (README §4.6) — mesmo espelho de TimelinePostReports.
// POST {{www}}/index.php/api/v1/chat-room-attachment-reports/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-attachment-reports/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get/{id}
$routes->get('get/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getDeletedAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/chat-room-attachment-reports/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::getAllWithDeleted', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/chat-room-attachment-reports/create — denunciar (usuario logado comum)
$routes->post('create', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/chat-room-attachment-reports/update/{id} — moderar (status/reviewed_*)
$routes->put('update/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachment-reports/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/chat-room-attachment-reports/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachment-reports/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachment-reports/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/chat-room-attachment-reports/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachmentReports\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
