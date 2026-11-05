<?php
// Rotas REST de consulta da view view_dash_ranking_zona
// Dominio Eleicoes2026 — Ranking de zonas por votos do candidato 22001 e por cargo. Filtro 'eleicoesauth' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico.
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-ranking-zona-view/find?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\DashRankingZona\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-ranking-zona-view/get-grouped?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\DashRankingZona\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-ranking-zona-view/search?q=termo&page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\DashRankingZona\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-ranking-zona-view/get-all?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\DashRankingZona\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-ranking-zona-view/get-no-pagination?sort=cd_municipio&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\DashRankingZona\ResourceViewController::getNoPagination');
