<?php
// Rotas REST para manipulacao da tabela timeline_post_comments
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota (roda depois do filtro
// de URI, com CurrentUser ja populado).
// Comentario de topo tem parent_id nulo; resposta preenche parent_id.
// POST {{www}}/index.php/api/v1/timeline-post-comments/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-post-comments/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-post-comments/create — comentar ou responder
$routes->post('create', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-post-comments/update/{id}
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-comments/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-post-comments/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-comments/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-comments/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-comments/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
