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
    // /Map — Modulo Map (Leaflet + OpenStreetMap + OpenRouteService + Nominatim):
    //        map_icons, map_manager, map_categories, map_postal_codes,
    //        map_addresses, map_points, map_routes, map_route_stops e
    //        map_geocode_cache. NAO ha rota publica: todo o modulo exige
    //        'jwtauth' por wildcard em Config/Filters.php, e as exclusoes
    //        definitivas somam 'adminonly' na propria rota. Contrato canonico:
    //        18 rotas por tabela e 9 por view — 9 tabelas + 9 views = 243 rotas.
    // =========================================================================

    $routes->group('map-icons', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapIcons/EndpointTable.php';
    });

    $routes->group('map-icons-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapIcons/EndPointView.php';
    });

    $routes->group('map-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapManager/EndpointTable.php';
    });

    $routes->group('map-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapManager/EndPointView.php';
    });

    $routes->group('map-categories', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapCategories/EndpointTable.php';
    });

    $routes->group('map-categories-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapCategories/EndPointView.php';
    });

    $routes->group('map-postal-codes', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapPostalCodes/EndpointTable.php';
    });

    $routes->group('map-postal-codes-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapPostalCodes/EndPointView.php';
    });

    $routes->group('map-addresses', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapAddresses/EndpointTable.php';
    });

    $routes->group('map-addresses-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapAddresses/EndPointView.php';
    });

    $routes->group('map-points', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapPoints/EndpointTable.php';
    });

    $routes->group('map-points-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapPoints/EndPointView.php';
    });

    $routes->group('map-routes', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapRoutes/EndpointTable.php';
    });

    $routes->group('map-routes-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapRoutes/EndPointView.php';
    });

    $routes->group('map-route-stops', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapRouteStops/EndpointTable.php';
    });

    $routes->group('map-route-stops-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapRouteStops/EndPointView.php';
    });

    $routes->group('map-geocode-cache', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapGeocodeCache/EndpointTable.php';
    });

    $routes->group('map-geocode-cache-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapGeocodeCache/EndPointView.php';
    });

    // /Map (cont.) — map_links: vinculo universal modulo <-> mapa (CEP, endereco, ponto ou
    //        rota para qualquer registro de modulo registrado em Config/MapLinkables.php).
    //        jwtauth por wildcard; adminonly na exclusao definitiva. +27 rotas (total 270).

    $routes->group('map-links', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapLinks/EndpointTable.php';
    });

    $routes->group('map-links-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapLinks/EndPointView.php';
    });

    // map-geo: proxy dos provedores de mapa (Nominatim, ViaCEP/BrasilAPI, OpenRouteService).
    // Desvio sancionado de 18/9 rotas (5 rotas proprias); jwtauth por wildcard.
    $routes->group('map-geo', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Map/MapGeo/EndpointGeo.php';
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
    // /Messages — mensagens diretas remetente -> destinatario. NUNCA e chat:
    //             sem sala, conversa ou thread. Agendamento (status scheduled)
    //             e read_at. 'jwtauth' por wildcard em Config/Filters.php; a
    //             exclusao definitiva soma 'adminonly' na propria rota.
    // =========================================================================

    $routes->group('messages-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessagesManager/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Messages/MessagesManager/EndpointCustom.php';
    });

    $routes->group('messages-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessagesManager/EndPointView.php';
    });

    // Resumo por interlocutor (view_messages_users): so leitura, escopada ao usuario logado.
    $routes->group('messages-users-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessagesUsers/EndPointView.php';
    });

    // Grupos de mensagem (message_groups_manager): dono + membros ativos; 'jwtauth' por wildcard.
    $routes->group('message-groups-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupsManager/EndpointTable.php';
    });

    $routes->group('message-groups-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupsManager/EndPointView.php';
    });

    // Membros dos grupos (message_group_members): liga usuarios a grupos (N:N). Escrita so do
    // dono do grupo ou admin; 'sync' grava varios vinculos numa transacao.
    $routes->group('message-group-members', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMembers/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMembers/EndpointCustom.php';
    });

    $routes->group('message-group-members-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMembers/EndPointView.php';
    });

    // Usuarios com contagem de grupos (fonte do card de usuarios) e grupos com membros (lista).
    $routes->group('message-users-groups-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageUsersGroups/EndPointView.php';
    });

    $routes->group('message-group-memberships-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMemberships/EndPointView.php';
    });

    // Mensagens de grupo (message_group_messages + messages_manager): envia ao grupo; 'jwtauth' por wildcard.
    $routes->group('message-group-messages', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMessages/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMessages/EndpointCustom.php';
    });

    $routes->group('message-group-messages-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupMessages/EndPointView.php';
    });

    // Anexos de mensagens (message_attachments): upload multipart no create + serve/download; 'jwtauth' por wildcard.
    $routes->group('message-attachments', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageAttachments/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Messages/MessageAttachments/EndpointUpload.php';
    });

    $routes->group('message-attachments-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageAttachments/EndPointView.php';
    });

    // Contatos do chat (view_message_contacts): usuarios ativos, sem o proprio; so leitura; 'jwtauth' por wildcard.
    $routes->group('message-contacts-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageContacts/EndPointView.php';
    });

    // Leitura por membro das mensagens de grupo (message_group_reads) e resumo do chat por grupo.
    $routes->group('message-group-reads', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupReads/EndpointTable.php';
    });

    $routes->group('message-group-reads-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupReads/EndPointView.php';
    });

    $routes->group('message-group-chat-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageGroupChat/EndPointView.php';
    });

    // Marcacao de usuario (@) nas mensagens de grupo (message_mentions).
    $routes->group('message-mentions', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageMentions/EndpointTable.php';
    });

    $routes->group('message-mentions-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageMentions/EndPointView.php';
    });

    // Advertencia de palavrao (message_warnings): TODAS as rotas somam 'adminonly' na propria rota.
    $routes->group('message-warnings', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageWarnings/EndpointTable.php';
    });

    $routes->group('message-warnings-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Messages/MessageWarnings/EndPointView.php';
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
    // /Company — cadastro de empresas (company_manager). Leitura: qualquer
    //            usuario autenticado; escrita: 'adminonly' rota a rota.
    // =========================================================================

    $routes->group('company-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyManager/EndpointTable.php';
    });

    // Publica: so id/name das empresas ativas (select do cadastro de usuario, sem sessao).
    $routes->group('company-manager-public', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyManager/EndpointPublic.php';
    });

    $routes->group('company-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyManager/EndPointView.php';
    });

    // Membros das empresas (company_members): liga usuarios a empresas (N:N), espelho de
    // message-group-members. Escrita so admin ('adminonly' rota a rota); 'sync' grava varios
    // vinculos numa transacao; leitura escopada as empresas do usuario.
    $routes->group('company-members', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyMembers/EndpointTable.php';
        require __DIR__ . '/Routes/Api/v1/Company/CompanyMembers/EndpointCustom.php';
    });

    $routes->group('company-members-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyMembers/EndPointView.php';
    });

    // Empresas com contagem/nomes de membros (lista) e usuarios com contagem de empresas (card de usuarios).
    $routes->group('company-memberships-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyMemberships/EndPointView.php';
    });

    $routes->group('company-users-companies-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Company/CompanyUsersCompanies/EndPointView.php';
    });

    // =========================================================================
    // /User/UserResourceAccess — permissao individual de usuario a form/list.
    //            CRUD todo 'adminonly'; resource-access/check so 'jwtauth'.
    // =========================================================================

    $routes->group('user-resource-access', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserResourceAccess/EndpointTable.php';
    });

    $routes->group('user-resource-access-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/User/UserResourceAccess/EndPointView.php';
    });

    $routes->group('resource-access', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Meta/ResourceAccess/Endpoint.php';
    });

    // =========================================================================
    // /Location — Modulo Location: location_types (tipos de local, rotulos
    //        globais) e location_manager (arvore recursiva por parent_id, de
    //        uma pasta ate uma galaxia; construivel de baixo para cima) com a
    //        view view_location_manager (depth, path_ids, path_names).
    //        Modulo independente: sem vinculo com outros modulos por ora.
    //        jwtauth por wildcard; adminonly na exclusao definitiva.
    //        Contrato canonico: 18 rotas por tabela e 9 por view = 45 rotas.
    // =========================================================================

    $routes->group('location-types', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Location/LocationTypes/EndpointTable.php';
    });

    $routes->group('location-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Location/LocationManager/EndpointTable.php';
    });

    $routes->group('location-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Location/LocationManager/EndPointView.php';
    });

    // =========================================================================
    // /Product — Modulo Product: product_manager (produto, arvore opcional por
    //        parent_id) e product_attributes (caracteristicas grupo -> campo),
    //        com as views view_product_manager e view_product_attributes.
    //        Independente: location_id e opcional (NULL = sem local).
    //        jwtauth por wildcard; adminonly na exclusao definitiva.
    //        Contrato canonico: 18 rotas por tabela e 9 por view = 54 rotas.
    // =========================================================================

    $routes->group('product-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Product/ProductManager/EndpointTable.php';
    });

    $routes->group('product-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Product/ProductManager/EndPointView.php';
    });

    $routes->group('product-attributes', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Product/ProductAttributes/EndpointTable.php';
    });

    $routes->group('product-attributes-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Product/ProductAttributes/EndPointView.php';
    });

    // =========================================================================
    // /Movement — Modulo Movement: movement_manager (entrada, saida, separacao,
    //        desperdicio, encomenda) com view_movement_manager e a view de saldo
    //        view_movement_stock (somente leitura). Semi-dependente: exige
    //        product_id; location_id e opcional.
    //        jwtauth por wildcard; adminonly na exclusao definitiva.
    //        Contrato canonico: 18 rotas por tabela e 9 por view = 36 rotas.
    // =========================================================================

    $routes->group('movement-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Movement/MovementManager/EndpointTable.php';
    });

    $routes->group('movement-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Movement/MovementManager/EndPointView.php';
    });

    $routes->group('movement-stock-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Movement/MovementStock/EndPointView.php';
    });

    // =========================================================================
    // /Service — Modulo Service: service_manager (catalogo, arvore opcional por
    //        parent_id), service_attributes (caracteristicas grupo -> campo) e
    //        service_order (pedido, orcamento e execucao) com as views
    //        view_service_manager, view_service_attributes, view_service_order e
    //        view_service_summary (somente leitura).
    //        Independente: sem ligacao com outros modulos.
    //        jwtauth por wildcard; adminonly na exclusao definitiva.
    //        Contrato canonico: 18 rotas por tabela e 9 por view = 90 rotas.
    // =========================================================================

    $routes->group('service-manager', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceManager/EndpointTable.php';
    });

    $routes->group('service-manager-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceManager/EndPointView.php';
    });

    $routes->group('service-attributes', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceAttributes/EndpointTable.php';
    });

    $routes->group('service-attributes-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceAttributes/EndPointView.php';
    });

    $routes->group('service-order', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceOrder/EndpointTable.php';
    });

    $routes->group('service-order-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceOrder/EndPointView.php';
    });

    $routes->group('service-summary-view', static function ($routes) {
        require __DIR__ . '/Routes/Api/v1/Service/ServiceSummary/EndPointView.php';
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
