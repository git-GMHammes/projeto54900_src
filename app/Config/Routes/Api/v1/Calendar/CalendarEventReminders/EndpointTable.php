<?php
// Rotas REST para manipulacao da tabela calendar_event_reminders
// POST {{www}}/index.php/api/v1/calendar-event-reminders/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-event-reminders/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get/{id}
$routes->get('get/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-reminders/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-event-reminders/create
$routes->post('create', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-event-reminders/update/{id}
$routes->put('update/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-reminders/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-event-reminders/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-reminders/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-reminders/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-event-reminders/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Calendar\CalendarEventReminders\ResourceTableController::clearDeleted/$1');
