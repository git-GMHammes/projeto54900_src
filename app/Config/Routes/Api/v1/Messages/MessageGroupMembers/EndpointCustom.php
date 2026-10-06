<?php
// Rota extra (fora do contrato de 18 rotas de tabela). Sob 'jwtauth' por
// wildcard (Config/Filters.php: api/v1/message-group-members/*).
//
// PUT {{www}}/index.php/api/v1/message-group-members/sync/{groupId}
//   corpo: {"add_user_ids":[1,2], "remove_user_ids":[3]} -> adiciona/reativa e remove membros do grupo numa transacao
$routes->put('sync/(:num)', 'Api\V1\Messages\MessageGroupMembers\ResourceTableController::sync/$1');
