<?php
// Rotas REST para manipulacao da tabela calendar_event_extended_properties
// POST {{www}}/index.php/api/v1/calendar-event-extended-properties/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-event-extended-properties/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get/{id}
$routes->get('get/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-extended-properties/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-event-extended-properties/create
$routes->post('create', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-event-extended-properties/update/{id}
$routes->put('update/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-extended-properties/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-event-extended-properties/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-extended-properties/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-extended-properties/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-event-extended-properties/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::clearDeleted/$1');
