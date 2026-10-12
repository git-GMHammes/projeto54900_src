<?php
// Rotas REST para consulta da view do modulo User\UserResourceAccess (user-resource-access-view). 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/user-resource-access-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserResourceAccess\ResourceViewController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/user-resource-access-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserResourceAccess\ResourceViewController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserResourceAccess\ResourceViewController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserResourceAccess\ResourceViewController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserResourceAccess\ResourceViewController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserResourceAccess\ResourceViewController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserResourceAccess\ResourceViewController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserResourceAccess\ResourceViewController::getAllWithDeleted', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/user-resource-access-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserResourceAccess\ResourceViewController::getDeletedAll', ['filter' => 'adminonly']);
