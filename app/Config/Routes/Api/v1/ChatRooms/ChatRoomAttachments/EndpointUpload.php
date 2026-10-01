<?php
// Rotas especificas do anexo do ChatRooms (streaming de binario).
// NAO fazem parte do contrato canonico de 18 rotas — mesmo desvio sancionado
// do modulo Upload e do TimelinePostAttachments, servindo SO a tabela
// chat_room_attachments (isolada do Upload). O envio do arquivo e o proprio
// POST create (multipart) do EndpointTable.php.
// Grupo sob 'jwtauth' por wildcard (Config/Filters.php): o frontend baixa o
// binario via fetch com Authorization (blob), nunca por <img src> direto.
//
// GET  {{www}}/index.php/api/v1/chat-room-attachments/serve/{id}     -> binario inline
$routes->get('serve/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::serve/$1');
// GET  {{www}}/index.php/api/v1/chat-room-attachments/download/{id}  -> binario como anexo
$routes->get('download/(:num)', 'Api\V1\ChatRooms\ChatRoomAttachments\ResourceTableController::download/$1');
