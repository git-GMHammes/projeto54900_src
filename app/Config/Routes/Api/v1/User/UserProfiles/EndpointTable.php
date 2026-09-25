<?php
// Rotas REST para manipulação da tabela user_profiles
// 'create' e a UNICA rota publica deste grupo (etapa 2 do Cadastro de
// Usuario). 'me' e 'update' sao self-service (jwtauth sozinho — update tem
// checagem propria admin-ou-dono em Processor::update(), NAO leve adminonly
// aqui ou quebra "Editar Perfil" de todo usuario). Todas as demais (listagem
// em massa e exclusao) exigem 'jwtauth'+'adminonly' — expõem/apagam dados de
// QUALQUER usuario (nome/telefone/whatsapp/email/cpf/endereco), nao so o
// proprio.
// GET  {{www}}/index.php/api/v1/user-profiles/me — perfil do usuario logado
// (self-service; usado pela tela "Editar Perfil" para achar o proprio
// registro sem depender de find/get-all com filtro montado no cliente).
$routes->get('me', 'Api\V1\User\UserProfiles\ResourceTableController::me', ['filter' => 'jwtauth']);
// POST {{www}}/index.php/api/v1/user-profiles/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\User\UserProfiles\ResourceTableController::find', ['filter' => ['jwtauth', 'adminonly']]);
// POST {{www}}/index.php/api/v1/user-profiles/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\User\UserProfiles\ResourceTableController::getGrouped', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\User\UserProfiles\ResourceTableController::search', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get/{id}
$routes->get('get/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::get/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\User\UserProfiles\ResourceTableController::getAll', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\User\UserProfiles\ResourceTableController::getNoPagination', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getWithDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\User\UserProfiles\ResourceTableController::getDeletedAll', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
// GET  {{www}}/index.php/api/v1/user-profiles/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted', ['filter' => ['jwtauth', 'adminonly']]);
// POST {{www}}/index.php/api/v1/user-profiles/create — PUBLICA: etapa 2 do Cadastro de Usuario
$routes->post('create', 'Api\V1\User\UserProfiles\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/user-profiles/update/{id} — self-service "Editar
// Perfil": Processor::update() ja restringe nao-admin ao proprio registro.
$routes->put('update/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::update/$1', ['filter' => 'jwtauth']);
// DELETE {{www}}/index.php/api/v1/user-profiles/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteSoft/$1', ['filter' => ['jwtauth', 'adminonly']]);
// PATCH  {{www}}/index.php/api/v1/user-profiles/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteRestore/$1', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-profiles/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::deleteHard/$1', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-profiles/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\User\UserProfiles\ResourceTableController::clearDeleted', ['filter' => ['jwtauth', 'adminonly']]);
// DELETE {{www}}/index.php/api/v1/user-profiles/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\User\UserProfiles\ResourceTableController::clearDeleted/$1', ['filter' => ['jwtauth', 'adminonly']]);
