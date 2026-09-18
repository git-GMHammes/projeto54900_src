<?php
// Rotas REST para manipulacao da tabela calendar_manager
// POST {{www}}/index.php/api/v1/calendar-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Calendar\CalendarManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/calendar-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/calendar-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Calendar\CalendarManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/calendar-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/calendar-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Calendar\CalendarManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/calendar-manager/create
$routes->post('create', 'Api\V1\Calendar\CalendarManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/calendar-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/calendar-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/calendar-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/calendar-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/calendar-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Calendar\CalendarManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/calendar-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Calendar\CalendarManager\ResourceTableController::clearDeleted/$1');
