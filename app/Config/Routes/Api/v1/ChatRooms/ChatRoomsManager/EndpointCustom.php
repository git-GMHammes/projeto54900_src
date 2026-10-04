<?php
// Rota extra de entrada em sala do ChatRooms (fora do contrato de 18 rotas de tabela).
// Sob 'jwtauth' por wildcard (Config/Filters.php: api/v1/chat-rooms-manager/*).
//
// POST {{www}}/index.php/api/v1/chat-rooms-manager/join/{id} -> entra na sala (membro ativo)
$routes->post('join/(:num)', 'Api\V1\ChatRooms\ChatRoomsManager\ResourceTableController::join/$1');
