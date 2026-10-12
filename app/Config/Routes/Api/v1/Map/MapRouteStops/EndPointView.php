<?php
// Rotas REST para consulta da view view_map_route_stops
// Modulo Map. 'jwtauth' por wildcard em Config/Filters.php; sem adminonly.
// POST {{www}}/index.php/api/v1/map-route-stops-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Map\MapRouteStops\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/map-route-stops-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Map\MapRouteStops\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Map\MapRouteStops\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Map\MapRouteStops\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Map\MapRouteStops\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Map\MapRouteStops\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Map\MapRouteStops\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Map\MapRouteStops\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/map-route-stops-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Map\MapRouteStops\ResourceViewController::getDeletedAll');
