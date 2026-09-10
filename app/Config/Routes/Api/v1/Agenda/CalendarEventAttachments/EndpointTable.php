<?php
// Rotas REST para manipulacao da tabela calendar_event_attachments
// POST {{www}}/index.php/api/v1/calendar-event-attachments/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-event-attachments/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get/{id}
$routes->get('get/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-event-attachments/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-event-attachments/create
$routes->post('create', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-event-attachments/update/{id}
$routes->put('update/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attachments/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-event-attachments/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attachments/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-event-attachments/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-event-attachments/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::clearDeleted/$1');
