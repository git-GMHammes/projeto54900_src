<?php
// Rotas REST SOMENTE LEITURA para a tabela eleicoes_2026_votos_1t_2t_22001_RJ
// Dominio Eleicoes2026 — votos do candidato 22001, 1o e 2o turno 2026 (RJ), por secao. 'jwtauth' + 'adminonly' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem create/update/delete: dados importados.
// POST {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/get/{id}
$routes->get('get/(:num)', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\Candidato22001\ResourceTableController::getNoPagination');
