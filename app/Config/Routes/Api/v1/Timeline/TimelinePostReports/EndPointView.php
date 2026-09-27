<?php
// Rotas REST para consulta da view view_timeline_post_reports
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php e
// 'adminonly' rota a rota nas NOVE rotas: este objeto e a fila de moderacao de
// denuncias — so admin le. O filtro de rota roda depois do filtro de URI, com
// CurrentUser ja populado.
// POST {{www}}/index.php/api/v1/timeline-post-reports-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::find', ['filter' => 'adminonly']);
// POST {{www}}/index.php/api/v1/timeline-post-reports-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getGrouped', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::search', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::get/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getAll', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getNoPagination', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getDeleted/$1', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getAllWithDeleted', ['filter' => 'adminonly']);
// GET  {{www}}/index.php/api/v1/timeline-post-reports-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePostReports\ResourceViewController::getDeletedAll', ['filter' => 'adminonly']);
