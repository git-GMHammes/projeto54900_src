<?php
// Rotas REST de consulta da view view_dash_eleitorado_zona
// Dominio Eleicoes2026 — Eleitorado por municipio e zona. Filtro 'eleicoesauth' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico.
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-eleitorado-zona-view/find?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\DashEleitoradoZona\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-eleitorado-zona-view/get-grouped?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\DashEleitoradoZona\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-eleitorado-zona-view/search?q=termo&page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\DashEleitoradoZona\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-eleitorado-zona-view/get-all?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\DashEleitoradoZona\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-eleitorado-zona-view/get-no-pagination?sort=cd_municipio&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\DashEleitoradoZona\ResourceViewController::getNoPagination');
