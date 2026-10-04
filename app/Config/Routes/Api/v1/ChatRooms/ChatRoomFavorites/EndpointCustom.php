<?php
// Rotas extras de favoritos do ChatRooms (fora do contrato de 18 rotas de tabela).
// Sob 'jwtauth' por wildcard (Config/Filters.php: api/v1/chat-room-favorites/*).
//
// POST   {{www}}/index.php/api/v1/chat-room-favorites/favorite/{roomId}   -> favorita (limite CHAT_FAVORITES_LIMIT)
// DELETE {{www}}/index.php/api/v1/chat-room-favorites/unfavorite/{roomId} -> remove dos favoritos
// GET    {{www}}/index.php/api/v1/chat-room-favorites/mine               -> favoritos do usuario e limite
$routes->post('favorite/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::favorite/$1');
$routes->delete('unfavorite/(:num)', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::unfavorite/$1');
$routes->get('mine', 'Api\V1\ChatRooms\ChatRoomFavorites\ResourceTableController::mine');
