<?php
// Rotas REST SOMENTE LEITURA para a tabela eleitorado_1_turno_2026_RJ
// Dominio Eleicoes2026 — eleitorado do 1o turno 2026 (RJ), por secao eleitoral. 'jwtauth' + 'adminonly' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem create/update/delete: dados importados.
// POST {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get/{id}
$routes->get('get/(:num)', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/eleicoes2026-eleitorado-1-turno-rj/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Eleicoes2026\Eleitorado1TurnoRj\ResourceTableController::getAllWithDeleted');
