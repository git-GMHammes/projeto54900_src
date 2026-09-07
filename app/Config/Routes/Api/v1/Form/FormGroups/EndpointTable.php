<?php
// Rotas REST para manipulacao da tabela form_groups
// POST {{www}}/index.php/api/v1/form-groups/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Form\FormGroups\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/form-groups/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Form\FormGroups\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/form-groups/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Form\FormGroups\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/form-groups/get/{id}
$routes->get('get/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/form-groups/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Form\FormGroups\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/form-groups/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Form\FormGroups\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/form-groups/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-groups/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-groups/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Form\FormGroups\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/form-groups/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/form-groups/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Form\FormGroups\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/form-groups/create
$routes->post('create', 'Api\V1\Form\FormGroups\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/form-groups/update/{id}
$routes->put('update/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/form-groups/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/form-groups/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/form-groups/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/form-groups/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Form\FormGroups\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/form-groups/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Form\FormGroups\ResourceTableController::clearDeleted/$1');
