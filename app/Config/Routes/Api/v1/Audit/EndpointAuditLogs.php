<?php
// Consulta do log de auditoria e acesso (tabela audit_logs). Somente leitura.
// Grupo: api/v1/audit-logs  ->  Api\V1\Audit\AuditLogController
//
// Sem filtro na propria rota: 'jwtauth' e 'adminonly' entram por wildcard em Config/Filters.php
// (api/v1/audit-logs/*). So o perfil administrador consulta.

// POST {{www}}/index.php/api/v1/audit-logs/find?page=1&limit=20&sort=id&order=desc
$routes->post('find', 'Api\V1\Audit\AuditLogController::find');
// GET  {{www}}/index.php/api/v1/audit-logs/show/{id}
$routes->get('show/(:num)', 'Api\V1\Audit\AuditLogController::show/$1');
