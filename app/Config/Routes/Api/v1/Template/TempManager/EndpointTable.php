<?php
// Catalogo de templates (template001/002/003). Acesso EXCLUSIVO do superuser: filtro 'superuseronly' por wildcard em Config/Filters.php.
// Rotas REST para manipulacao da tabela temp_manager
// POST {{www}}/index.php/api/v1/temp-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Template\TempManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/temp-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Template\TempManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/temp-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Template\TempManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/temp-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/temp-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Template\TempManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/temp-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Template\TempManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/temp-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Template\TempManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/temp-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/temp-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Template\TempManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/temp-manager/create
$routes->post('create', 'Api\V1\Template\TempManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/temp-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/temp-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/temp-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/temp-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::deleteHard/$1');
// DELETE {{www}}/index.php/api/v1/temp-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Template\TempManager\ResourceTableController::clearDeleted');
// DELETE {{www}}/index.php/api/v1/temp-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Template\TempManager\ResourceTableController::clearDeleted/$1');
