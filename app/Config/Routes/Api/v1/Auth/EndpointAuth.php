<?php
// Rotas de autenticacao (emissao/consumo de JWT).
// Grupo: api/v1/auth  ->  Api\V1\Auth\AuthController
//
// login, refresh e logout sao publicos. logout identifica a sessao pelo
// Bearer ou pelo { refresh_token } do corpo (funciona com access expirado).
// me exige "Authorization: Bearer" valido e com sessao ativa via o filtro
// 'jwtauth' (unico grupo da API com esse filtro hoje).

// POST {{www}}/index.php/api/v1/auth/login
$routes->post('login', 'Api\V1\Auth\AuthController::login');
// POST {{www}}/index.php/api/v1/auth/refresh
$routes->post('refresh', 'Api\V1\Auth\AuthController::refresh');
// POST {{www}}/index.php/api/v1/auth/logout
$routes->post('logout', 'Api\V1\Auth\AuthController::logout');
// GET  {{www}}/index.php/api/v1/auth/me
$routes->get('me', 'Api\V1\Auth\AuthController::me', ['filter' => 'jwtauth']);
