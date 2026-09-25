<?php
// Rotas REST para manipulação da tabela user_manager
// 'create' e a UNICA rota publica deste grupo (etapa 1 do Cadastro de
// Usuario) — todas as demais exigem sessao ativa ('jwtauth') E perfil admin
// ('adminonly', roda depois — precisa de CurrentUser ja populado), mesmo
// padrao de jwtauth sozinho ja usado em auth/me (ver
// Config/Routes/Api/v1/Auth/EndpointAuth.php).
// POST {{www}}/index.php/api/v1/user-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserManager\ResourceTableController::find', ['filter' => ['jwtauth', 'adminonly']]);
// POST {{www}}/index.php/api/v1/user-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserManager\ResourceTableController::getGrouped', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserManager\ResourceTableController::search', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserManager\ResourceTableController::get/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserManager\ResourceTableController::getAll', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserManager\ResourceTableController::getNoPagination', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getWithDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserManager\ResourceTableController::getDeletedAll', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted', ['filter' => ['jwtauth', 'adminonly']]);
// POST {{www}}/index.php/api/v1/user-manager/create — PUBLICA: etapa 1 do Cadastro de Usuario
$routes->post('create', 'Api\V1\User\UserManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/user-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\User\UserManager\ResourceTableController::update/$1', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteSoft/$1', ['filter' => ['jwtauth', 'adminonly']]);
// PATCH  {{www}}/index.php/api/v1/user-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteRestore/$1', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-manager/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\User\UserManager\ResourceTableController::deleteHard/$1', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-manager/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\User\UserManager\ResourceTableController::clearDeleted', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-manager/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\User\UserManager\ResourceTableController::clearDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
