<?php
// Rotas REST para manipulacao da tabela temp_menu
// POST {{www}}/index.php/api/v1/temp-menu/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Template\TempMenu\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/temp-menu/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Template\TempMenu\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/temp-menu/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Template\TempMenu\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/temp-menu/get/{id}
$routes->get('get/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/temp-menu/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Template\TempMenu\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/temp-menu/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Template\TempMenu\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/temp-menu/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-menu/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-menu/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Template\TempMenu\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/temp-menu/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-menu/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Template\TempMenu\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/temp-menu/create
$routes->post('create', 'Api\V1\Template\TempMenu\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/temp-menu/update/{id}
$routes->put('update/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-menu/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/temp-menu/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-menu/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-menu/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Template\TempMenu\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-menu/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Template\TempMenu\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
