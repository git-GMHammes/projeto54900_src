<?php
// Rotas REST para manipulacao da tabela calendar_event_attendees
// POST {{www}}/index.php/api/v1/calendar-event-attendees/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-event-attendees/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get/{id}
$routes->get('get/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attendees/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-event-attendees/create
$routes->post('create', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-event-attendees/update/{id}
$routes->put('update/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::update/$1');
// PUT  {{www}}/index.php/api/v1/calendar-event-attendees/respond/{calendar_event_id} — self-service,
// aceita/recusa o proprio convite (CurrentUser::id(), nao um id de attendee vindo do cliente)
$routes->put('respond/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::respond/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attendees/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-event-attendees/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attendees/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attendees/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-event-attendees/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::clearDeleted/$1');
