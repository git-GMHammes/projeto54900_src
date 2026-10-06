<?php
// Rotas extras (fora do contrato de 18 rotas de tabela). Sob 'jwtauth' por
// wildcard (Config/Filters.php: api/v1/messages-manager/*).
//
// GET   {{www}}/index.php/api/v1/messages-manager/with/{userId} -> mensagens entre o usuario logado e {userId}
// PATCH {{www}}/index.php/api/v1/messages-manager/read/{userId} -> marca como lidas as mensagens recebidas de {userId}
// GET   {{www}}/index.php/api/v1/messages-manager/unread-count -> total de mensagens recebidas (sent) ainda nao lidas pelo usuario logado
// PUT   {{www}}/index.php/api/v1/messages-manager/chat/{id} -> MODO CHAT: edita a propria mensagem, SO enquanto agendada
// DELETE {{www}}/index.php/api/v1/messages-manager/chat/{id} -> MODO CHAT: apaga a propria mensagem (status=removed)
$routes->get('with/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::with/$1');
$routes->patch('read/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::read/$1');
$routes->get('unread-count', 'Api\V1\Messages\MessagesManager\ResourceTableController::unreadCount');
$routes->put('chat/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::chatEdit/$1');
$routes->delete('chat/(:num)', 'Api\V1\Messages\MessagesManager\ResourceTableController::chatRemove/$1');
