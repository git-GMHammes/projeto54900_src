<?php
// Rotas REST para manipulacao da tabela timeline_manager
// Modulo Messages/Timeline. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php — o modulo NAO tem rota publica. As rotas de
// exclusao definitiva somam 'adminonly' na propria rota: o filtro de rota roda
// depois do filtro de URI, com CurrentUser ja populado.
// A timeline nasce sozinha na primeira publicacao (Processor de TimelinePosts),
// mas o CRUD completo existe para o usuario editar a propria timeline.
// POST {{www}}/index.php/api/v1/timeline-manager/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelineManager\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/timeline-manager/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-manager/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelineManager\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/timeline-manager/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-manager/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelineManager\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/timeline-manager/create
$routes->post('create', 'Api\V1\Timeline\TimelineManager\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/timeline-manager/update/{id}
$routes->put('update/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/timeline-manager/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/timeline-manager/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/timeline-manager/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-manager/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Timeline\TimelineManager\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/timeline-manager/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Timeline\TimelineManager\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
