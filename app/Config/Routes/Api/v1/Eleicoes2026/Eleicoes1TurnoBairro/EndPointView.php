<?php
// Rotas REST de consulta da view view_eleicoes_2026_1_turno_bairro
// Dominio Eleicoes2026 — secao eleitoral x municipio x bairro (1o turno 2026). 'jwtauth' + 'adminonly' por wildcard em Config/Filters.php (api/v1/eleicoes2026-*/*).
// Sem get/(:num): a view nao tem id numerico (chave cd_municipio_zona_secao, texto).
// POST {{www}}/index.php/api/v1/eleicoes2026-1-turno-bairro-view/find?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->post('find', 'Api\V1\Eleicoes2026\Eleicoes1TurnoBairro\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/eleicoes2026-1-turno-bairro-view/get-grouped?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->post('get-grouped', 'Api\V1\Eleicoes2026\Eleicoes1TurnoBairro\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/eleicoes2026-1-turno-bairro-view/search?q=termo&page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->get('search', 'Api\V1\Eleicoes2026\Eleicoes1TurnoBairro\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/eleicoes2026-1-turno-bairro-view/get-all?page=1&limit=20&sort=cd_municipio_zona_secao&order=ASC
$routes->get('get-all', 'Api\V1\Eleicoes2026\Eleicoes1TurnoBairro\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/eleicoes2026-1-turno-bairro-view/get-no-pagination?sort=cd_municipio_zona_secao&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Eleicoes2026\Eleicoes1TurnoBairro\ResourceViewController::getNoPagination');
