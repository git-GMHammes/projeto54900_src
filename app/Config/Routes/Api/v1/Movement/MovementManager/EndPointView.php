<?php
// Rotas REST para consulta da view movement_manager
// Modulo Movement — movimento de produto. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// POST {{www}}/index.php/api/v1/movement-manager-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Movement\MovementManager\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/movement-manager-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Movement\MovementManager\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/movement-manager-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Movement\MovementManager\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Movement\MovementManager\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Movement\MovementManager\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Movement\MovementManager\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Movement\MovementManager\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Movement\MovementManager\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/movement-manager-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Movement\MovementManager\ResourceViewController::getDeletedAll');
