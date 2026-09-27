<?php
// Rotas REST para consulta da view view_timeline_posts (o feed do modulo)
// Modulo Messages/Timeline. 'jwtauth' por wildcard em Config/Filters.php — o
// requisito e "publico para quem estiver logado", entao nenhuma rota do feed e
// publica e nenhuma e adminonly. Esta e a view que alimenta a listagem do feed
// (list_manager slug 'timeline-feed').
// POST {{www}}/index.php/api/v1/timeline-posts-view/find?page=1&limit=20&sort=id&order=ASC
$routes->post('find', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::find');
// POST {{www}}/index.php/api/v1/timeline-posts-view/get-grouped?page=1&limit=20&sort=id&order=ASC
$routes->post('get-grouped', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getGrouped');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/search?q=termo&page=1&limit=20&sort=id&order=ASC
$routes->get('search', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::search');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get/{id}
$routes->get('get/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::get/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getAll');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get-no-pagination?sort=id&order=ASC
$routes->get('get-no-pagination', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getNoPagination');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get-deleted/{id}
$routes->get('get-deleted/(:num)', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getDeleted/$1');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get-all-with-deleted?page=1&limit=20&sort=id&order=ASC
$routes->get('get-all-with-deleted', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getAllWithDeleted');
// GET  {{www}}/index.php/api/v1/timeline-posts-view/get-deleted-all?page=1&limit=20&sort=id&order=ASC
$routes->get('get-deleted-all', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::getDeletedAll');

// Rota EXTRA (fora do contrato canonico de 9), mesmo padrao de
// calendar-event-attendees/respond e calendar-event-invites/accept-token: o
// feed misto da Home Feed (cotas de hoje/outros usuarios aleatorio + mais
// curtidas/avaliadas ranking) — ver Services/V1/Timeline/TimelinePosts/Processor::homeFeed.
// GET  {{www}}/index.php/api/v1/timeline-posts-view/home-feed?seed=123&page=1&limit=10
$routes->get('home-feed', 'Api\V1\Timeline\TimelinePosts\ResourceViewController::homeFeed');
