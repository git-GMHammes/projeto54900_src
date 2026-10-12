<?php
// Rotas REST para consulta da view do modulo Company\CompanyUsersCompanies (company-users-companies-view). 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/company-users-companies-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/company-users-companies-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/company-users-companies-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getDeletedAll');
