<?php
// Rota extra de leitura das mensagens de uma sala (fora do contrato de 18 rotas de tabela).
// Sob 'jwtauth' por wildcard (Config/Filters.php: api/v1/chat-messages/*).
// Só membro ativo da sala ou admin lê.
//
// GET {{www}}/index.php/api/v1/chat-messages/room/{roomId} -> mensagens enviadas da sala
$routes->get('room/(:num)', 'Api\V1\ChatRooms\ChatMessages\ResourceTableController::room/$1');
