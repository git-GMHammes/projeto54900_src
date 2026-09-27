<?php
// Rotas REST para consulta da view view_timeline_post_ratings
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php; sem
// adminonly — avaliacao de post do feed e publica para quem esta logado.
// POST {{www}}/index.php/api/v1/timeline-post-ratings-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/timeline-post-ratings-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/timeline-post-ratings-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getDeletedAll');
