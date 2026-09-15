<?php
// Rotas REST para manipulacao da tabela bootstrap_icons
// POST {{www}}/index.php/api/v1/bootstrap-icons/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\BootstrapIcons\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/bootstrap-icons/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\BootstrapIcons\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\BootstrapIcons\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get/{id}
$routes->get('get/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\BootstrapIcons\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\BootstrapIcons\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\BootstrapIcons\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/bootstrap-icons/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\BootstrapIcons\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/bootstrap-icons/create
$routes->post('create', 'Api\V1\BootstrapIcons\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/bootstrap-icons/update/{id}
$routes->put('update/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/bootstrap-icons/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/bootstrap-icons/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/bootstrap-icons/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/bootstrap-icons/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\BootstrapIcons\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/bootstrap-icons/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\BootstrapIcons\ResourceTableController::clearDeleted/$1');
