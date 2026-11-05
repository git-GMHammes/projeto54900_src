<?php
// Rotas REST de consulta da view view_dash_votos_partido
// Dominio Eleicoes2026 — Votos do candidato 22001 por cargo e partido. Filtro 'eleicoesauth' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico.
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-votos-partido-view/find?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\DashVotosPartido\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-votos-partido-view/get-grouped?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\DashVotosPartido\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-partido-view/search?q=termo&page=1&limit=20&sort=ds_cargo&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\DashVotosPartido\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-partido-view/get-all?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\DashVotosPartido\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-partido-view/get-no-pagination?sort=ds_cargo&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\DashVotosPartido\ResourceViewController::getNoPagination');
