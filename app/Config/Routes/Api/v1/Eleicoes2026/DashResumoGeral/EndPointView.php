<?php
// Rotas REST de consulta da view view_dash_resumo_geral
// Dominio Eleicoes2026 — Resumo geral do estado: votos por cargo, eleitorado, secoes, locais, municipios, zonas e bairros. Filtro 'eleicoesauth' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico.
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-resumo-geral-view/find?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\DashResumoGeral\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-resumo-geral-view/get-grouped?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\DashResumoGeral\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-resumo-geral-view/search?q=termo&page=1&limit=20&sort=ds_cargo&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\DashResumoGeral\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-resumo-geral-view/get-all?page=1&limit=20&sort=ds_cargo&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\DashResumoGeral\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-resumo-geral-view/get-no-pagination?sort=ds_cargo&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\DashResumoGeral\ResourceViewController::getNoPagination');
