<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Api\DefaultApi::index');
$routes->get('/codeigniter', 'Home::index');

$routes->group('api/v1', static function ($routes) {

    // =========================================================================
    // /Auth — Login/refresh/logout/me (emissao/consumo de JWT). login, refresh
    //         e logout publicos; me exige filtro 'jwtauth'. Nenhum outro grupo
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

    // Diretorio minimo de usuarios (id/username/nome/email) — liberado a
    // qualquer usuario logado (jwtauth), ao contrario de user-manager-view
    // (adminonly). Usado por selects de "convidar usuario" (ex.: calendario).
    $routes->group('user-directory-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserDirectory/EndPointView.php';
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

    // Convite de evento por e-mail com token temporario. 'accept-token' e a
    // unica rota publica do grupo (filtro por rota no EndpointTable.php, nao
    // por wildcard em Config/Filters.php), igual ao padrao de user-manager.
    $routes->group('calendar-event-invites', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Calendar/CalendarEventInvites/EndpointTable.php';
    });

    // =========================================================================
    // /Timeline — Modulo Messages/Timeline: timeline_manager (a timeline de cada
    //            usuario) > timeline_posts > {attachments, comments, reactions,
    //            ratings, reports}. NAO ha rota publica: todo o modulo exige
    //            'jwtauth' por wildcard em Config/Filters.php, e as rotas de
    //            moderacao de denuncia e de exclusao definitiva somam
    //            'adminonly' na propria rota (ver TimelinePostReports).
    //            Contrato canonico: 18 rotas por tabela e 9 por view — sao 7
    //            tabelas + 7 views = 189 rotas.
    //            ATENCAO: Controller/Processor/Model/Request da Etapa D ainda
    //            nao existem; as rotas existem para fechar o contrato e passam a
    //            responder quando a Etapa D for implementada.
    // =========================================================================

    $routes->group('timeline-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelineManager/EndpointTable.php';
    });

    $routes->group('timeline-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelineManager/EndPointView.php';
    });

    $routes->group('timeline-posts', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePosts/EndpointTable.php';
    });

    $routes->group('timeline-posts-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePosts/EndPointView.php';
    });

    $routes->group('timeline-post-attachments', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostAttachments/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostAttachments/EndpointUpload.php';
    });

    $routes->group('timeline-post-attachments-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostAttachments/EndPointView.php';
    });

    $routes->group('timeline-post-comments', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostComments/EndpointTable.php';
    });

    $routes->group('timeline-post-comments-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostComments/EndPointView.php';
    });

    $routes->group('timeline-post-reactions', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostReactions/EndpointTable.php';
    });

    $routes->group('timeline-post-reactions-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostReactions/EndPointView.php';
    });

    $routes->group('timeline-post-ratings', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostRatings/EndpointTable.php';
    });

    $routes->group('timeline-post-ratings-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostRatings/EndPointView.php';
    });

    $routes->group('timeline-post-reports', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostReports/EndpointTable.php';
    });

    $routes->group('timeline-post-reports-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Timeline/TimelinePostReports/EndPointView.php';
    });

    // =========================================================================
    // /ChatRooms — Modulo ChatRooms: chat_rooms_manager (a sala, dono =
    //              moderador), chat_messages (mensagem da sala),
    //              chat_room_attachments (anexo da mensagem),
    //              chat_room_attachment_reports (denuncia de anexo, acao
    //              imediata — README §4.6), chat_room_warnings (advertencia
    //              de palavrao, modulo inteiro adminonly — README §4.5) e
    //              chat_room_favorites (sala favorita, toggle idempotente —
    //              README §2.7/§4.10). Backend construido para estas 6
    //              tabelas (2026-09-28 e 2026-09-29) — chat_room_members
    //              ainda nao tem Controller/Processor/Model/Request
    //              completos, so o schema (ver README_modulo_chatrooms.md) e
    //              um Model interno minimo, usado pelo Processor de
    //              ChatRoomAttachmentReports. NAO ha rota publica: todo o
    //              modulo exige 'jwtauth' por wildcard em Config/Filters.php;
    //              chat-room-attachment-reports(-view) somam 'adminonly' em
    //              quase tudo (fila de moderacao, so 'create' e livre);
    //              chat-room-warnings(-view) somam 'adminonly' em TODAS as
    //              rotas (nao ha "autor" de uma advertencia); as demais rotas
    //              de exclusao definitiva dos outros recursos somam
    //              'adminonly' na propria rota. Mesmo espelho de
    //              TimelineManager/TimelinePostReactions/TimelinePostReports.
    // =========================================================================

    $routes->group('chat-rooms-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndpointCustom.php';
    });

    $routes->group('chat-rooms-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndPointView.php';
    });

    $routes->group('chat-messages', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatMessages/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatMessages/EndpointCustom.php';
    });

    $routes->group('chat-messages-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatMessages/EndPointView.php';
    });

    $routes->group('chat-room-attachments', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndpointUpload.php';
    });

    $routes->group('chat-room-attachments-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomAttachments/EndPointView.php';
    });

    $routes->group('chat-room-attachment-reports', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomAttachmentReports/EndpointTable.php';
    });

    $routes->group('chat-room-attachment-reports-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomAttachmentReports/EndPointView.php';
    });

    $routes->group('chat-room-warnings', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomWarnings/EndpointTable.php';
    });

    $routes->group('chat-room-warnings-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomWarnings/EndPointView.php';
    });

    $routes->group('chat-room-favorites', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomFavorites/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomFavorites/EndpointCustom.php';
    });

    $routes->group('chat-room-favorites-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomFavorites/EndPointView.php';
    });

    $routes->group('chat-room-members', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomMembers/EndpointTable.php';
    });

    $routes->group('chat-room-members-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/ChatRooms/ChatRoomMembers/EndPointView.php';
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
