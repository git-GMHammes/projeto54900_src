<?php
// Rotas REST para manipulacao da tabela timeline_post_reactions
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota (roda depois do filtro
// de URI, com CurrentUser ja populado).
// Nao ha formulario para esta tabela: like/dislike e acao de um clique, usando
// 'create' na primeira vez e 'update' para alternar like <-> dislike (UNIQUE
// timeline_post_id + user_manager_id garante uma reacao por usuario por post).
// POST {{www}}/index.php/api/v1/timeline-post-reactions/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-post-reactions/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-post-reactions/create — curtir / nao curtir
$routes->post('create', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-post-reactions/update/{id} — alternar like <-> dislike
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-reactions/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-post-reactions/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-reactions/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reactions/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reactions/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
