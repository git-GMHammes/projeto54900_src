<?php
// Rotas REST para manipulacao da tabela calendar_events
// POST {{www}}/index.php/api/v1/calendar-events/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-events/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-events/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-events/get/{id}
$routes->get('get/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-events/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-events/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-events/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-events/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-events/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-events/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-events/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-events/create
$routes->post('create', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-events/update/{id}
$routes->put('update/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/calendar-events/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-events/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-events/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-events/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-events/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Agenda\CalendarEvents\ResourceTableController::clearDeleted/$1');
