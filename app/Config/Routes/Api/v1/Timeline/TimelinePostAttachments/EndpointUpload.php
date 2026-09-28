<?php
// Rotas especificas do anexo da Timeline (streaming de binario).
// NAO fazem parte do contrato canonico de 18 rotas — mesmo desvio sancionado
// do modulo Upload (EndpointUpload.php de Upload/UploadManager), mas servindo
// SO a tabela timeline_post_attachments (isolada do Upload e do Calendar).
// O envio do arquivo e o proprio POST create (multipart) do EndpointTable.php.
// Grupo sob 'jwtauth' por wildcard (Config/Filters.php): o frontend baixa o
// binario via fetch com Authorization (blob), nunca por <img src> direto.
//
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/serve/{id}     -> binario inline
$routes->get('serve/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::serve/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/download/{id}  -> binario como anexo
$routes->get('download/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::download/$1');
