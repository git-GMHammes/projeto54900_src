<?php
// Rotas REST para consulta da view view_map_categories
// Modulo Map. 'jwtauth' por wildcard em Config/Filters.php; sem adminonly.
// POST {{www}}/index.php/api/v1/map-categories-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapCategories\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/map-categories-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapCategories\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-categories-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapCategories\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/map-categories-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapCategories\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/map-categories-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapCategories\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/map-categories-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapCategories\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-categories-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapCategories\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-categories-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapCategories\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/map-categories-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapCategories\ResourceViewController::getDeletedAll');
