<?php
// Rotas REST para manipulacao da tabela aux_cor
// POST {{www}}/index.php/api/v1/aux-cor/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\AuxCor\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/aux-cor/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\AuxCor\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/aux-cor/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\AuxCor\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/aux-cor/get/{id}
$routes->get('get/(:num)', 'Api\V1\AuxCor\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/aux-cor/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\AuxCor\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/aux-cor/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\AuxCor\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/aux-cor/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\AuxCor\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/aux-cor/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\AuxCor\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/aux-cor/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\AuxCor\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/aux-cor/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\AuxCor\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/aux-cor/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\AuxCor\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/aux-cor/create
$routes->post('create', 'Api\V1\AuxCor\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/aux-cor/update/{id}
$routes->put('update/(:num)', 'Api\V1\AuxCor\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/aux-cor/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\AuxCor\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/aux-cor/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\AuxCor\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/aux-cor/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\AuxCor\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/aux-cor/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\AuxCor\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/aux-cor/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\AuxCor\ResourceTableController::clearDeleted/$1');
