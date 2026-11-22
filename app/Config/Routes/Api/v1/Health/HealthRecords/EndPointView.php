<?php
// Rotas REST para consulta da view view_health_records
// Modulo Health — prontuario com paciente, profissional (conselho), ordem de servico e servico (somente leitura). 'jwtauth' por wildcard em Config/Filters.php.
// POST {{www}}/index.php/api/v1/health-records-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Health\HealthRecords\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/health-records-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Health\HealthRecords\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/health-records-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Health\HealthRecords\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/health-records-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Health\HealthRecords\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/health-records-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Health\HealthRecords\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/health-records-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Health\HealthRecords\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/health-records-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Health\HealthRecords\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/health-records-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Health\HealthRecords\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/health-records-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Health\HealthRecords\ResourceViewController::getDeletedAll');

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 13:18:40
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122160000_modulo_saude_apis_plano.json
Objetivo: 9 rotas da view view_health_records.
Proposito: expor a API V1 do modulo Health (Saude), um submodulo por tabela ou view criada no banco DEV, seguindo o padrao ROADMAP_padrao_modulo (6 camadas, 18 rotas por tabela, 9 por view).
Motivo: pedido do usuario para gerar apenas APIs e backend das 7 tabelas e 8 views health_*.
Ligacoes: company_manager (company_id da sessao), user_manager e user_profiles (medico e paciente), service_order e service_manager (atendimento), health_* (demais submodulos).
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\app\Config\Routes\Api\v1\Health\HealthRecords\EndPointView.php
*/
