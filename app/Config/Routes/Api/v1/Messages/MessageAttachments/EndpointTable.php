<?php
// Rotas REST para manipulacao da tabela message_attachments
// Modulo Messages. O grupo inteiro exige sessao ativa ('jwtauth') por
// wildcard em Config/Filters.php. As 3 rotas de exclusao definitiva somam
// 'adminonly' na propria rota.
// O arquivo sobe pelo proprio POST create (multipart, campo `file`) e vai
// para writable/uploads/message_attachments/<messages_manager_id>/; serve/download do
// binario ficam em EndpointUpload.php (mesmo grupo).
// POST {{www}}/index.php/api/v1/message-attachments/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Messages\MessageAttachments\ResourceTableController::find');
// POST {{www}}/index.php/api/v1/message-attachments/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getGrouped');
// GET  {{www}}/index.php/api/v1/message-attachments/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Messages\MessageAttachments\ResourceTableController::search');
// GET  {{www}}/index.php/api/v1/message-attachments/get/{id}
$routes->get('get/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::get/$1');
// GET  {{www}}/index.php/api/v1/message-attachments/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getAll');
// GET  {{www}}/index.php/api/v1/message-attachments/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getNoPagination');
// GET  {{www}}/index.php/api/v1/message-attachments/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-attachments/get-with-deleted/{id}
$routes->get('get-with-deleted/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-attachments/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getDeletedAll');
// GET  {{www}}/index.php/api/v1/message-attachments/get-all-with-deleted/{id}
$routes->get('get-all-with-deleted/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getAllWithDeleted/$1');
// GET  {{www}}/index.php/api/v1/message-attachments/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Messages\MessageAttachments\ResourceTableController::getAllWithDeleted');
// POST {{www}}/index.php/api/v1/message-attachments/create (multipart)
$routes->post('create', 'Api\V1\Messages\MessageAttachments\ResourceTableController::create');
// PUT  {{www}}/index.php/api/v1/message-attachments/update/{id}
$routes->put('update/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::update/$1');
// DELETE {{www}}/index.php/api/v1/message-attachments/delete-soft/{id}
$routes->delete('delete-soft/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::deleteSoft/$1');
// PATCH  {{www}}/index.php/api/v1/message-attachments/delete-restore/{id}
$routes->patch('delete-restore/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::deleteRestore/$1');
// DELETE {{www}}/index.php/api/v1/message-attachments/delete-hard/{id} — adminonly
$routes->delete('delete-hard/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::deleteHard/$1', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-attachments/clear-deleted — adminonly
$routes->delete('clear-deleted', 'Api\V1\Messages\MessageAttachments\ResourceTableController::clearDeleted', ['filter' => 'adminonly']);
// DELETE {{www}}/index.php/api/v1/message-attachments/clear-deleted/{id} — adminonly
$routes->delete('clear-deleted/(:num)', 'Api\V1\Messages\MessageAttachments\ResourceTableController::clearDeleted/$1', ['filter' => 'adminonly']);
