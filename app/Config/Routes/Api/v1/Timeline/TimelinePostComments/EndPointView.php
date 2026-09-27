<?php
// Rotas REST para consulta da view view_timeline_post_comments
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php; sem
// adminonly — comentario de post do feed e publico para quem esta logado.
// POST {{www}}/index.php/api/v1/timeline-post-comments-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/timeline-post-comments-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/timeline-post-comments-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostComments\ResourceViewController::getDeletedAll');
