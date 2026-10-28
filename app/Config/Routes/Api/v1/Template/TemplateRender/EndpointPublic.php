<?php
// Rota PUBLICA (fora de jwtauth: nao esta em Config/Filters.php). Alimenta o template do visitante, antes do login.
// Devolve o template padrao (id, code, name) e os cabecalhos e rodapes ativos da empresa do slug. Sem nav, menu nem casca do app.
// GET {{www}}/index.php/api/v1/template-public/get/{slug}
$routes->get('get/(:segment)', 'Api\V1\Template\TemplateRender\RenderController::publicTemplate/$1');
