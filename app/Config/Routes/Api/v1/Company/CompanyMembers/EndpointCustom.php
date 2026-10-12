<?php
// Rota extra (fora do contrato de 18 rotas de tabela). 'jwtauth' por wildcard
// (Config/Filters.php: api/v1/company-members/*) + 'adminonly' na propria rota:
// so admin gerencia os membros da empresa.
//
// PUT {{www}}/index.php/api/v1/company-members/sync/{companyId}
//   corpo: {"add_user_ids":[1,2], "remove_user_ids":[3]} -> adiciona/reativa e remove membros da empresa numa transacao
$routes->put('sync/(:num)', 'Api\V1\Company\CompanyMembers\ResourceTableController::sync/$1', ['filter' => 'adminonly']);
