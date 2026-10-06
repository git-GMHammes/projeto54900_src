<?php
// Rotas extras (fora do contrato de 18 rotas de tabela). Sob 'jwtauth' por
// wildcard (Config/Filters.php: api/v1/messages-manager/*).
//
// GET   {{www}}/index.php/api/v1/messages-manager/with/{userId} -> mensagens entre o usuario logado e {userId}
// PATCH {{www}}/index.php/api/v1/messages-manager/read/{userId} -> marca como lidas as mensagens recebidas de {userId}
$routes->get('with/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::with/$1');
$routes->patch('read/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::read/$1');
