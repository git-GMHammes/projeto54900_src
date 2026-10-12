<?php
// Rotas do proxy dos provedores de mapa (Nominatim, ViaCEP/BrasilAPI, OpenRouteService).
// Grupo: api/v1/map-geo  ->  Api\V1\Map\MapGeo\GeoController
// Desvio sancionado do contrato de 18/9 rotas (como db-schema e upload).
// 'jwtauth' por wildcard em Config/Filters.php; guest nao consulta.
//
// GET  {{www}}/index.php/api/v1/map-geo/status
$routes->get('status', 'Api\V1\Map\MapGeo\GeoController::status');
// GET  {{www}}/index.php/api/v1/map-geo/search?q=rua+x&limit=5&country=br
$routes->get('search', 'Api\V1\Map\MapGeo\GeoController::geocode');
// GET  {{www}}/index.php/api/v1/map-geo/reverse?lat=-22.9&lng=-43.1
$routes->get('reverse', 'Api\V1\Map\MapGeo\GeoController::reverse');
// GET  {{www}}/index.php/api/v1/map-geo/cep/{cep}[?refresh=1]
$routes->get('cep/(:segment)', 'Api\V1\Map\MapGeo\GeoController::cep/$1');
// POST {{www}}/index.php/api/v1/map-geo/route   { "profile": "driving-car", "coordinates": [[lng,lat],[lng,lat]], "save": {"map_manager_id": 1, "name": "..."} }
$routes->post('route', 'Api\V1\Map\MapGeo\GeoController::route');
