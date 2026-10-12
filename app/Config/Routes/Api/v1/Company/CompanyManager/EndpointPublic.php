<?php
// Rota PUBLICA (fora de jwtauth: nao esta em Config/Filters.php). Alimenta o select de empresa
// do cadastro de usuario, que roda sem sessao. Devolve so id e name das empresas ativas.
// GET {{www}}/index.php/api/v1/company-manager-public/get-no-pagination
$routes->get('get-no-pagination', 'Api\V1\Company\CompanyManager\PublicOptionsController::getNoPagination');
