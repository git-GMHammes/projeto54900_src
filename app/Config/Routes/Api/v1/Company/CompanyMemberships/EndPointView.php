<?php
// Rotas REST para consulta da view do modulo Company\CompanyMemberships (company-memberships-view). 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/company-memberships-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Company\CompanyMemberships\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/company-memberships-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/company-memberships-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Company\CompanyMemberships\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Company\CompanyMemberships\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/company-memberships-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Company\CompanyMemberships\ResourceViewController::getDeletedAll');
