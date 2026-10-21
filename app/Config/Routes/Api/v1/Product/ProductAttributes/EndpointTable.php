<?php
// Rotas REST para manipulacao da tabela product_attributes
// Modulo Product — caracteristicas do produto. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// por wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas
// de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/product-attributes/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Product\ProductAttributes\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/product-attributes/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Product\ProductAttributes\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/product-attributes/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Product\ProductAttributes\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/product-attributes/get/{id}
$routes->get('get/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/product-attributes/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Product\ProductAttributes\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/product-attributes/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Product\ProductAttributes\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/product-attributes/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/product-attributes/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/product-attributes/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Product\ProductAttributes\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/product-attributes/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/product-attributes/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Product\ProductAttributes\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/product-attributes/create
$routes->post('create', 'Api\V1\Product\ProductAttributes\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/product-attributes/update/{id}
$routes->put('update/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/product-attributes/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/product-attributes/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/product-attributes/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/product-attributes/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Product\ProductAttributes\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/product-attributes/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Product\ProductAttributes\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
