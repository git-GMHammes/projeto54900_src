<?php
// Rotas REST para consulta da view view_timeline_post_attachments
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php; sem
// adminonly — os anexos visiveis sao os do feed, que ja e publico para logado.
// POST {{www}}/index.php/api/v1/timeline-post-attachments-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/timeline-post-attachments-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/timeline-post-attachments-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getDeletedAll');
