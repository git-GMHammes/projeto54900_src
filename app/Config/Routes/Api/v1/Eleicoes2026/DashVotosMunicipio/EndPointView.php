<?php
// Rotas REST de consulta da view view_dash_votos_municipio
// Dominio Eleicoes2026 — Votos do candidato 22001 e eleitorado por municipio e cargo. Filtro 'eleicoesauth' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico.
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-votos-municipio-view/find?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\DashVotosMunicipio\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-dash-votos-municipio-view/get-grouped?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\DashVotosMunicipio\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-municipio-view/search?q=termo&page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\DashVotosMunicipio\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-municipio-view/get-all?page=1&limit=20&sort=cd_municipio&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\DashVotosMunicipio\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-dash-votos-municipio-view/get-no-pagination?sort=cd_municipio&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\DashVotosMunicipio\ResourceViewController::getNoPagination');
