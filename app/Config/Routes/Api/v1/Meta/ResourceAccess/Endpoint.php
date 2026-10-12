<?php
// Verificacao de acesso individual a form/list (modulo User/UserResourceAccess).
// Desvio sancionado: 1 rota propria. 'jwtauth' por wildcard em Config/Filters.php.
// GET {{www}}/index.php/api/v1/resource-access/check?type=form&id=1  (ou &slug=...)
$routes->get('check', 'Api\V1\User\UserResourceAccess\ResourceTableController::check');
