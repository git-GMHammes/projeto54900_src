<?php
// Rotas REST para consulta da view view_messages_users
// Modulo Messages. 'jwtauth' por wildcard em Config/Filters.php. A leitura e
// escopada no Processor: cada usuario ve so as proprias linhas (owner); admin ve todas.
// POST {{www}}/index.php/api/v1/messages-users-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessagesUsers\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/messages-users-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/messages-users-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessagesUsers\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/messages-users-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessagesUsers\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/messages-users-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/messages-users-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/messages-users-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/messages-users-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/messages-users-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessagesUsers\ResourceViewController::getDeletedAll');
