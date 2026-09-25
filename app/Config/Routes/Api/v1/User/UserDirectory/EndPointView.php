<?php
// Rotas REST para consulta da view view_user_directory (diretorio minimo de
// usuarios: id, um_username, uc_name, uc_email — sem senha/status/role/CPF).
// Grupo inteiro so exige 'jwtauth' (ver Config/Filters.php) — QUALQUER usuario
// logado pode consultar, ao contrario de user-manager-view (adminonly).
// POST {{www}}/index.php/api/v1/user-directory-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserDirectory\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/user-directory-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserDirectory\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/user-directory-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserDirectory\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/user-directory-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserDirectory\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/user-directory-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserDirectory\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/user-directory-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserDirectory\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/user-directory-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserDirectory\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/user-directory-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserDirectory\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/user-directory-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserDirectory\ResourceViewController::getDeletedAll');
