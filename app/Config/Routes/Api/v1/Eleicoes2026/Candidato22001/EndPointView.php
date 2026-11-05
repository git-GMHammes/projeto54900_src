<?php
// Rotas REST de consulta da view view_eleicoes_2026_22001_22
// Dominio Eleicoes2026 — votos do candidato 22001. 'jwtauth' + 'adminonly' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico nem chave unica.
// POST {{www}}/index.php/api/v1/eleicoes2026-candidato-22001-view/find?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\Candidato22001\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-candidato-22001-view/get-grouped?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\Candidato22001\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001-view/search?q=termo&page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\Candidato22001\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001-view/get-all?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\Candidato22001\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-candidato-22001-view/get-no-pagination?sort=cd_municipio_zona_secao&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\Candidato22001\ResourceViewController::getNoPagination');
