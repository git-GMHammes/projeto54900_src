<?php
// Rotas REST para manipulacao da tabela temp_nav
// POST {{www}}/index.php/api/v1/temp-nav/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Template\TempNav\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/temp-nav/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Template\TempNav\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/temp-nav/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Template\TempNav\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/temp-nav/get/{id}
$routes->get('get/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/temp-nav/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Template\TempNav\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/temp-nav/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Template\TempNav\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/temp-nav/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-nav/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-nav/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Template\TempNav\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/temp-nav/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-nav/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Template\TempNav\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/temp-nav/create
$routes->post('create', 'Api\V1\Template\TempNav\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/temp-nav/update/{id}
$routes->put('update/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-nav/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/temp-nav/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-nav/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-nav/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Template\TempNav\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/temp-nav/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Template\TempNav\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
