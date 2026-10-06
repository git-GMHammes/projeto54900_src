<?php
// Rotas REST para consulta da view view_message_group_posts
// Modulo Messages. "jwtauth" por wildcard em Config/Filters.php; escopo no Processor.
// POST {{www}}/index.php/api/v1/message-group-messages-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/message-group-messages-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/message-group-messages-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageGroupMessages\ResourceViewController::getDeletedAll');
