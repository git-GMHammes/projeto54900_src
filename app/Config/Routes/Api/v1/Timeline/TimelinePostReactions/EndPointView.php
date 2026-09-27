<?php
// Rotas REST para consulta da view view_timeline_post_reactions
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php; sem
// adminonly — reacao de post do feed e publica para quem esta logado.
// POST {{www}}/index.php/api/v1/timeline-post-reactions-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/timeline-post-reactions-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/timeline-post-reactions-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getDeletedAll');
