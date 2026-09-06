<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

$routes->group('api/v1', static function ($routes) {

    // =========================================================================
    // /User — Módulo de usuários
    // =========================================================================

    $routes->group('user-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserManager/EndpointTable.php';
    });

    $routes->group('user-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserManager/EndPointView.php';
    });
});
