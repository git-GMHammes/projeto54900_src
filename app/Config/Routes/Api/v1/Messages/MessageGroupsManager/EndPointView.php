<?php
// Rotas REST para consulta da view view_message_groups_manager
// Modulo Messages. 'jwtauth' por wildcard em Config/Filters.php. A leitura e
// escopada no Processor: so o dono, membros ativos do grupo ou admin.
// POST {{www}}/index.php/api/v1/message-groups-manager-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/message-groups-manager-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/message-groups-manager-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupsManager\ResourceViewController::getDeletedAll');
