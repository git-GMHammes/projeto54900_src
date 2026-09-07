<?php
// Rotas REST para manipulacao da tabela form_campos
// POST {{www}}/index.php/api/v1/form-campos/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Form\FormCampos\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/form-campos/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Form\FormCampos\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/form-campos/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Form\FormCampos\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/form-campos/get/{id}
$routes->get('get/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/form-campos/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Form\FormCampos\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/form-campos/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Form\FormCampos\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/form-campos/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-campos/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-campos/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Form\FormCampos\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/form-campos/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-campos/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Form\FormCampos\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/form-campos/create
$routes->post('create', 'Api\V1\Form\FormCampos\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/form-campos/update/{id}
$routes->put('update/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/form-campos/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/form-campos/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/form-campos/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/form-campos/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Form\FormCampos\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/form-campos/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Form\FormCampos\ResourceTableController::clearDeleted/$1');
