<?php
// Rotas REST para consulta da view service_order
// Modulo Service — pedido de servico. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// POST {{www}}/index.php/api/v1/service-order-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Service\ServiceOrder\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/service-order-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Service\ServiceOrder\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/service-order-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Service\ServiceOrder\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/service-order-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Service\ServiceOrder\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/service-order-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Service\ServiceOrder\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/service-order-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Service\ServiceOrder\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/service-order-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Service\ServiceOrder\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/service-order-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Service\ServiceOrder\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/service-order-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Service\ServiceOrder\ResourceViewController::getDeletedAll');
