<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Api\DefaultApi::index');
$routes->get('/codeigniter', 'Home::index');

$routes->group('api/v1', static function ($routes) {

    // =========================================================================
    // /Auth — Login/refresh/logout/me (emissao/consumo de JWT). login e refresh
    //         publicos; logout e me exigem filtro 'jwtauth'. Nenhum outro grupo
    //         desta lista usa 'jwtauth' ainda — decisao explicita, ver
    //         src/writable/claude/20260914164550_login_cadastro_jwt_plano.json.
    // =========================================================================

    $routes->group('auth', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Auth/EndpointAuth.php';
    });

    // =========================================================================
    // /User — Módulo de usuários
    // =========================================================================

    $routes->group('user-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserManager/EndpointTable.php';
    });

    $routes->group('user-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserManager/EndPointView.php';
    });

    $routes->group('user-roles', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserRoles/EndpointTable.php';
    });

    $routes->group('user-profiles', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserProfiles/EndpointTable.php';
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
    //         form_rows > form_fields) + view de ligacao view_form_manager.
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
    // /List — Modulo de construtor de listagens (list_manager > list_columns,
    //         list_manager > list_actions — colecoes irmas, sem aninhamento).
    //         APIs publicas (sem JWT), mesmo endpoint-set do modulo Form.
    // =========================================================================

    $routes->group('list-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/List/ListManager/EndpointTable.php';
    });

    $routes->group('list-columns', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/List/ListColumns/EndpointTable.php';
    });

    $routes->group('list-actions', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/List/ListActions/EndpointTable.php';
    });

    // =========================================================================
    // /BootstrapIcons — catalogo de icones do Bootstrap Icons (usado pelo
    //                    IconSelect do frontend). Populado por
    //                    Database/Seeds/BootstrapIconsSeeder.php.
    // =========================================================================

    $routes->group('bootstrap-icons', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/BootstrapIcons/EndpointTable.php';
    });

    // =========================================================================
    // /AuxCor — catalogo de cores nomeadas (usado pelo SelectField do
    //           frontend com colorKey). Populado por
    //           doc/sql/insert/20260923135922_aux_cor.sql.
    // =========================================================================

    $routes->group('aux-cor', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/AuxCor/EndpointTable.php';
    });

    // =========================================================================
    // /Calendar — Modulo de calendario (espelho do Google Calendar): calendar_manager >
    //           calendar_events > {attendees, reminders, attachments,
    //           extended_properties}. APIs REST, contrato canonico (18 rotas).
    // =========================================================================

    $routes->group('calendar-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarManager/EndpointTable.php';
    });

    $routes->group('calendar-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarManager/EndPointView.php';
    });

    $routes->group('calendar-events', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEvents/EndpointTable.php';
    });

    $routes->group('calendar-event-attendees', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEventAttendees/EndpointTable.php';
    });

    $routes->group('calendar-event-reminders', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEventReminders/EndpointTable.php';
    });

    $routes->group('calendar-event-attachments', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEventAttachments/EndpointTable.php';
    });

    $routes->group('calendar-event-extended-properties', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEventExtendedProperties/EndpointTable.php';
    });

    // =========================================================================
    // /Nav — config/branding do app/navbar: nome, imagem, icone de mensagens,
    //        versao do sistema.
    // =========================================================================

    $routes->group('nav-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Nav/NavManager/EndpointTable.php';
    });

    // =========================================================================
    // /Menu — arvore de itens navegaveis (submenus via parent_id), ligada a
    //         um nav_manager.
    // =========================================================================

    $routes->group('menu-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Menu/MenuManager/EndpointTable.php';
    });

    // =========================================================================
    // /Nav — config/branding do app/navbar: nome, imagem, icone de mensagens,
    //        versao do sistema.
    // =========================================================================

    $routes->group('nav-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Nav/NavManager/EndpointTable.php';
    });

    // =========================================================================
    // /Menu — arvore de itens navegaveis (submenus via parent_id), ligada a
    //         um nav_manager.
    // =========================================================================

    $routes->group('menu-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Menu/MenuManager/EndpointTable.php';
    });

    // =========================================================================
    // /Meta — utilitarios read-only. db-schema: introspeccao do banco
    //         (lista tabelas e colunas). Desvio sancionado: 3 rotas proprias.
    // =========================================================================

    $routes->group('db-schema', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Meta/DbSchema/Endpoint.php';
    });

    // =========================================================================
    // /Meta/route-manager — catalogo de rotas da API/frontend (CRUD completo,
    //        padrao Manager), para selecionar uma rota pre-cadastrada em vez
    //        de digita-la.
    // =========================================================================

    $routes->group('route-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Meta/RouteManager/EndpointTable.php';
    });
});
