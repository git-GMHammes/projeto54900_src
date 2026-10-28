<?php
// Rota do template inteiro da empresa da sessao (nav, menu, cabecalhos e rodapes). Somente leitura, 'jwtauth' por wildcard em Config/Filters.php.
// GET  {{www}}/index.php/api/v1/template-render/get?temp_nav_id=1   (temp_nav_id opcional; padrao: o primeiro temp_nav ativo da empresa)
$routes->get('get', 'Api\V1\Template\TemplateRender\RenderController::render');
// PUT  {{www}}/index.php/api/v1/template-render/preference   body: {"temp_manager_id": 2}  ou  {"temp_manager_id": null} (volta ao automatico)
// Grava so a preferencia do PROPRIO usuario da sessao ('jwtauth' por wildcard em Config/Filters.php).
$routes->put('preference', 'Api\V1\Template\TemplateRender\RenderController::preference');
