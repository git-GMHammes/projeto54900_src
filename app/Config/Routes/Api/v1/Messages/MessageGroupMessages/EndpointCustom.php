<?php
// Rotas extras do MODO CHAT (fora do contrato de 18 rotas de tabela). Sob 'jwtauth' por wildcard
// (Config/Filters.php: api/v1/message-group-messages/*). So membro ativo do grupo.
//
// GET   {{www}}/index.php/api/v1/message-group-messages/chat/{groupId}       -> conversa do grupo (ultimas 200)
// PATCH {{www}}/index.php/api/v1/message-group-messages/chat/{groupId}/read  -> marca como lidas as mensagens do grupo
$routes->get('chat/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::chat/$1');
$routes->patch('chat/(:num)/read', 'Api\V1\Messages\MessageGroupMessages\ResourceTableController::chatRead/$1');
