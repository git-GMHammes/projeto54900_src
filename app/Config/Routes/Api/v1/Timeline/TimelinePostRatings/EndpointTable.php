<?php
// Rotas REST para manipulacao da tabela timeline_post_ratings
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota (roda depois do filtro
// de URI, com CurrentUser ja populado).
// Nao ha formulario para esta tabela: a estrela e acao de um clique. O intervalo
// 1..5 e regra do Request/Processor (o banco nao usa CHECK). UNIQUE
// timeline_post_id + user_manager_id garante uma avaliacao por usuario por post.
// POST {{www}}/index.php/api/v1/timeline-post-ratings/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-post-ratings/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-post-ratings/create — avaliar (1..5)
$routes->post('create', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-post-ratings/update/{id} — trocar a nota
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-ratings/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-post-ratings/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-post-ratings/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-ratings/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-ratings/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
