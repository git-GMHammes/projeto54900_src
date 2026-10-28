<?php
// Rotas REST para manipulacao da tabela temp_header
// POST {{www}}/index.php/api/v1/temp-header/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Template\TempHeader\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/temp-header/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Template\TempHeader\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/temp-header/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Template\TempHeader\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/temp-header/get/{id}
$routes->get('get/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/temp-header/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Template\TempHeader\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/temp-header/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Template\TempHeader\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/temp-header/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-header/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-header/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Template\TempHeader\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/temp-header/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-header/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Template\TempHeader\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/temp-header/create
$routes->post('create', 'Api\V1\Template\TempHeader\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/temp-header/update/{id}
$routes->put('update/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-header/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/temp-header/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-header/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-header/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Template\TempHeader\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-header/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Template\TempHeader\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
