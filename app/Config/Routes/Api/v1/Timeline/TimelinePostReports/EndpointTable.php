<?php
// Rotas REST para manipulacao da tabela timeline_post_reports
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica.
// ESTE e o grupo da fila de moderacao: 'create' (denunciar) e do usuario logado
// comum; TODAS as outras rotas somam 'adminonly' na propria rota, porque leem ou
// alteram denuncias de terceiros (status, reviewed_by, reviewed_at, review_note,
// alem das exclusoes definitivas). O filtro de rota roda depois do filtro de URI,
// com CurrentUser ja populado.
// POST {{www}}/index.php/api/v1/timeline-post-reports/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/timeline-post-reports/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getDeletedAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAllWithDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAllWithDeleted', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/timeline-post-reports/create — denunciar (usuario logado comum)
$routes->post('create', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-post-reports/update/{id} — moderar (status/reviewed_*)
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::update/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reports/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteSoft/$1', ['filter' => 'adminonly']);
// PATCH  {{www}}/index.php/api/v1/timeline-post-reports/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteRestore/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reports/delete-hard/{id}
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reports/clear-deleted
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-post-reports/clear-deleted/{id}
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
