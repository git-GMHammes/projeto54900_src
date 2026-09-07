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

    // =========================================================================
    // /Upload — Modulo de uploads (anexos polimorficos de outros modulos)
    // =========================================================================

    $routes->group('upload-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Upload/UploadManager/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Upload/UploadManager/EndpointUpload.php';
    });

    $routes->group('upload-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Upload/UploadManager/EndPointView.php';
    });

    // =========================================================================
    // /Form — Modulo de formularios dinamicos (form_manager > form_groups >
    //         form_rows > form_campos) + view de ligacao view_form_manager.
    //         APIs publicas (sem JWT).
    // =========================================================================

    $routes->group('form-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Form/FormManager/EndpointTable.php';
    });

    $routes->group('form-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Form/FormManager/EndPointView.php';
    });

    $routes->group('form-groups', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Form/FormGroups/EndpointTable.php';
    });

    $routes->group('form-rows', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Form/FormRows/EndpointTable.php';
    });

    $routes->group('form-campos', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Form/FormCampos/EndpointTable.php';
    });

    // =========================================================================
    // /Meta — utilitarios read-only. db-schema: introspeccao do banco
    //         (lista tabelas e colunas). Desvio sancionado: 3 rotas proprias.
    // =========================================================================

    $routes->group('db-schema', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Meta/DbSchema/Endpoint.php';
    });
});
