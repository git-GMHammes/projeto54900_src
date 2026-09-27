<?php
// Rotas REST para manipulacao da tabela timeline_posts
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota (roda depois do filtro
// de URI, com CurrentUser ja populado).
// 'create' e o caminho normal do usuario logado: publica (ou republica, via
// repost_of_id). O Processor cria a timeline do usuario se ela ainda nao existir.
// POST {{www}}/index.php/api/v1/timeline-posts/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-posts/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-posts/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-posts/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-posts/create — publicar ou republicar (repost_of_id)
$routes->post('create', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-posts/update/{id}
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-posts/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-posts/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-posts/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-posts/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-posts/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
