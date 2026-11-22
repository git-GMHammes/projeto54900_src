<?php
// Rotas REST para manipulacao da tabela health_prescriptions
// Modulo Health — receita e medicamento de um prontuario. 'jwtauth' por wildcard em Config/Filters.php; adminonly na exclusao definitiva.
// O modulo NAO tem rota publica. As rotas de exclusao definitiva somam 'adminonly' na propria rota.
// POST {{www}}/index.php/api/v1/health-prescriptions/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/health-prescriptions/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/health-prescriptions/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get/{id}
$routes->get('get/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/health-prescriptions/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/health-prescriptions/create
$routes->post('create', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/health-prescriptions/update/{id}
$routes->put('update/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/health-prescriptions/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::deleteSoft/$1');
// PATCH {{www}}/index.php/api/v1/health-prescriptions/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/health-prescriptions/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/health-prescriptions/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/health-prescriptions/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Health\HealthPrescriptions\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: 18 rotas da tabela health_prescriptions.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Config\Routes\Api\v1\Health\HealthPrescriptions\EndpointTable.php
*/
