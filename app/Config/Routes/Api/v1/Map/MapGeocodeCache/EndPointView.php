<?php
// Rotas REST para consulta da view view_map_geocode_cache
// Modulo Map. 'jwtauth' por wildcard em Config/Filters.php; sem adminonly.
// POST {{www}}/index.php/api/v1/map-geocode-cache-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/map-geocode-cache-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/map-geocode-cache-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapGeocodeCache\ResourceViewController::getDeletedAll');
