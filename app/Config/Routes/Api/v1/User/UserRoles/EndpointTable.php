<?php
// Rotas REST de LEITURA da tabela user_roles (perfis de acesso).
// Grupo: api/v1/user-roles  ->  Api\V1\User\UserRoles\ResourceTableController
// Modulo read-only: sem create/update/delete.
//
// POST {{www}}/index.php/api/v1/user-roles/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserRoles\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/user-roles/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserRoles\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/user-roles/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserRoles\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/user-roles/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserRoles\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/user-roles/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserRoles\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/user-roles/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserRoles\ResourceTableController::getNoPagination');
