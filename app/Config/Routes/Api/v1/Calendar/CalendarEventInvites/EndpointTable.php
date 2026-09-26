<?php
// Rotas REST para manipulacao da tabela calendar_event_invites.
// 'accept-token' e a UNICA rota publica deste grupo (o convidado clica no
// link do e-mail sem sessao ativa) — todas as demais exigem sessao ('jwtauth'),
// mesmo padrao de rota mista ja usado em user-manager/EndpointTable.php.
// POST {{www}}/index.php/api/v1/calendar-event-invites/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::find', ['filter' => 'jwtauth']);
// POST {{www}}/index.php/api/v1/calendar-event-invites/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getGrouped', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::search', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get/{id}
$routes->get('get/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::get/$1', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAll', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getNoPagination', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getDeleted/$1', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getWithDeleted/$1', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getDeletedAll', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'jwtauth']);
// GET  {{www}}/index.php/api/v1/calendar-event-invites/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAllWithDeleted', ['filter' => 'jwtauth']);
// POST {{www}}/index.php/api/v1/calendar-event-invites/create — organizador convida por e-mail
$routes->post('create', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::create', ['filter' => 'jwtauth']);
// PUT  {{www}}/index.php/api/v1/calendar-event-invites/update/{id}
$routes->put('update/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::update/$1', ['filter' => 'jwtauth']);
// POST {{www}}/index.php/api/v1/calendar-event-invites/accept-token — PUBLICA: convidado clica no link do e-mail
$routes->post('accept-token', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::acceptToken');
// DELETE {{www}}/index.php/api/v1/calendar-event-invites/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteSoft/$1', ['filter' => 'jwtauth']);
// PATCH  {{www}}/index.php/api/v1/calendar-event-invites/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteRestore/$1', ['filter' => 'jwtauth']);
// DELETE {{www}}/index.php/api/v1/calendar-event-invites/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteHard/$1', ['filter' => 'jwtauth']);
// DELETE {{www}}/index.php/api/v1/calendar-event-invites/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::clearDeleted', ['filter' => 'jwtauth']);
// DELETE {{www}}/index.php/api/v1/calendar-event-invites/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Calendar\CalendarEventInvites\ResourceTableController::clearDeleted/$1', ['filter' => 'jwtauth']);
