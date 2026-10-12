<?php
// Rotas REST para manipulacao da tabela do modulo Company\CompanyManager (company-manager)
// POST {{www}}/index.php/api/v1/company-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Company\CompanyManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/company-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Company\CompanyManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/company-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Company\CompanyManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/company-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/company-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Company\CompanyManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/company-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Company\CompanyManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/company-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Company\CompanyManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/company-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Company\CompanyManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/company-manager/create
$routes->post('create', 'Api\V1\Company\CompanyManager\ResourceTableController::create', ['filter' => 'adminonly']);
// PUT  {{www}}/index.php/api/v1/company-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/company-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/company-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/company-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/company-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Company\CompanyManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/company-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Company\CompanyManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
