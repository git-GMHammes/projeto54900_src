<?php
// Rotas REST para manipulacao da tabela timeline_post_attachments
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota (roda depois do filtro
// de URI, com CurrentUser ja populado).
// O arquivo em si sobe pela tela (writable/uploads/timeline_posts/<post_id>/);
// estas rotas gravam e mantem os metadados do anexo.
// POST {{www}}/index.php/api/v1/timeline-post-attachments/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-post-attachments/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-post-attachments/create
$routes->post('create', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-post-attachments/update/{id}
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-attachments/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-post-attachments/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-attachments/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-attachments/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-attachments/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
