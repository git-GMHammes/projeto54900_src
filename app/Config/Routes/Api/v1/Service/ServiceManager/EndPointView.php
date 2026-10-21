<?php
// Rotas REST para consulta da view service_manager
// Modulo Service — catalogo de servicos. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// POST {{www}}/index.php/api/v1/service-manager-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Service\ServiceManager\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/service-manager-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Service\ServiceManager\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/service-manager-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Service\ServiceManager\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/service-manager-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Service\ServiceManager\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/service-manager-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Service\ServiceManager\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/service-manager-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Service\ServiceManager\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/service-manager-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Service\ServiceManager\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-manager-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Service\ServiceManager\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/service-manager-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Service\ServiceManager\ResourceViewController::getDeletedAll');
