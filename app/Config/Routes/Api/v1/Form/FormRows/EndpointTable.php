<?php
// Rotas REST para manipulacao da tabela form_rows
// POST {{www}}/index.php/api/v1/form-rows/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Form\FormRows\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/form-rows/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Form\FormRows\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/form-rows/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Form\FormRows\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/form-rows/get/{id}
$routes->get('get/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/form-rows/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Form\FormRows\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/form-rows/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Form\FormRows\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/form-rows/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-rows/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-rows/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Form\FormRows\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/form-rows/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-rows/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Form\FormRows\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/form-rows/create
$routes->post('create', 'Api\V1\Form\FormRows\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/form-rows/update/{id}
$routes->put('update/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/form-rows/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/form-rows/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/form-rows/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/form-rows/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Form\FormRows\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/form-rows/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Form\FormRows\ResourceTableController::clearDeleted/$1');
