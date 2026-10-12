<?php
// Rotas REST para consulta da view do modulo Company\CompanyMembers (company-members-view). 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/company-members-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Company\CompanyMembers\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/company-members-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Company\CompanyMembers\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/company-members-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Company\CompanyMembers\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/company-members-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Company\CompanyMembers\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/company-members-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Company\CompanyMembers\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/company-members-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Company\CompanyMembers\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/company-members-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Company\CompanyMembers\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-members-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Company\CompanyMembers\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/company-members-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Company\CompanyMembers\ResourceViewController::getDeletedAll');
