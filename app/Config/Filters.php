<?php

namespace Config;

use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\Cors;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\ForceHTTPS;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\PageCache;
use CodeIgniter\Filters\PerformanceMetrics;
use CodeIgniter\Filters\SecureHeaders;
use App\Filters\JwtAuthFilter;
use App\Filters\AdminOnlyFilter;

class Filters extends BaseFilters
{
    /**
     * Configures aliases for Filter classes to
     * make reading things nicer and simpler.
     *
     * @var array<string, class-string|list<class-string>>
     *
     * [filter_name => classname]
     * or [filter_name => [classname1, classname2, ...]]
     */
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'cors'          => Cors::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,
        'jwtauth'       => JwtAuthFilter::class,
        'adminonly'     => AdminOnlyFilter::class,
    ];

    /**
     * List of special required filters.
     *
     * The filters listed here are special. They are applied before and after
     * other kinds of filters, and always applied even if a route does not exist.
     *
     * Filters set by default provide framework functionality. If removed,
     * those functions will no longer work.
     *
     * @see https://codeigniter.com/user_guide/incoming/filters.html#provided-filters
     *
     * @var array{before: list<string>, after: list<string>}
     */
    public array $required = [
        'before' => [
            'forcehttps', // Force Global Secure Requests
            'pagecache',  // Web Page Caching
        ],
        'after' => [
            'pagecache',   // Web Page Caching
            'performance', // Performance Metrics
            'toolbar',     // Debug Toolbar
        ],
    ];

    /**
     * List of filter aliases that are always
     * applied before and after every request.
     *
     * @var array{
     *     before: array<string, array{except: list<string>|string}>|list<string>,
     *     after: array<string, array{except: list<string>|string}>|list<string>
     * }
     */
    public array $globals = [
        'before' => [
            // 'honeypot',
            // 'csrf',
            // 'invalidchars',
        ],
        'after' => [
            // 'honeypot',
            // 'secureheaders',
        ],
    ];

    /**
     * List of filter aliases that works on a
     * particular HTTP method (GET, POST, etc.).
     *
     * Example:
     * 'POST' => ['foo', 'bar']
     *
     * If you use this, you should disable auto-routing because auto-routing
     * permits any HTTP method to access a controller. Accessing the controller
     * with a method you don't expect could bypass the filter.
     *
     * @var array<string, list<string>>
     */
    public array $methods = [];

    /**
     * List of filter aliases that should run on any
     * before or after URI patterns.
     *
     * Example:
     * 'isLoggedIn' => ['before' => ['account/*', 'profiles/*']]
     *
     * jwtauth aqui cobre os grupos de api/v1 SEM nenhuma rota publica (tudo
     * exige sessao). auth/* e form-manager-view/* ficam de fora (publicos por
     * decisao de produto). user-manager e user-profiles tambem ficam de fora
     * deste wildcard porque cada um tem UMA rota publica (create, cadastro de
     * usuario) misturada com rotas administrativas — a protecao deles e feita
     * rota a rota em Config/Routes/Api/v1/User/{UserManager,UserProfiles}/EndpointTable.php,
     * com ['filter' => 'jwtauth'] igual ao usado em auth/me.
     *
     * adminonly SEMPRE depois de jwtauth (precisa de CurrentUser ja populado):
     * hoje cobre o modulo user-manager (dados de login/senha de outros
     * usuarios) — api/v1/user-manager-view/* aqui por wildcard (grupo sem
     * rota publica) e api/v1/user-manager/* rota a rota no proprio
     * EndpointTable.php (['filter' => ['jwtauth', 'adminonly']]), pelo mesmo
     * motivo do jwtauth acima: nao pode vazar pra rota publica 'create'.
     *
     * api/v1/user-directory-view/* (2026-09-25) e EXCECAO DELIBERADA a
     * adminonly: view_user_directory so tem id/um_username/uc_name/uc_email
     * (sem senha/status/role/CPF/telefone/endereco), entao qualquer usuario
     * logado pode listar/buscar — usado pelo select de "convidar usuario" do
     * calendario, que precisa achar qualquer usuario do sistema, nao so os
     * que um admin cadastrou. NUNCA adicionar este prefixo ao array
     * 'adminonly' abaixo nem trocar a view por view_user_manager/user_manager
     * (essas tem colunas sensiveis de outros usuarios).
     *
     * /Timeline (2026-09-26): mesmo desenho do Calendar — jwtauth por
     * wildcard nos 14 grupos, porque o modulo nao tem NENHUMA rota publica.
     * A diferenca e o 'adminonly', que aqui nao entra por wildcard: as rotas de
     * moderacao de denuncia (timeline-post-reports e timeline-post-reports-view)
     * e as exclusoes definitivas das 7 tabelas trazem ['filter' => 'adminonly']
     * na propria rota do EndpointTable.php, porque dentro do mesmo grupo existe
     * rota que o usuario comum precisa (create = publicar/denunciar).
     *
     * @var array<string, array<string, list<string>>>
     */
    public array $filters = [
        'jwtauth' => [
            'before' => [
                'api/v1/user-manager-view/*',
                'api/v1/user-directory-view/*',
                'api/v1/user-roles/*',
                'api/v1/upload-manager/*',
                'api/v1/upload-manager-view/*',
                'api/v1/form-manager/*',
                'api/v1/form-groups/*',
                'api/v1/form-rows/*',
                'api/v1/form-campos/*',
                'api/v1/list-manager/*',
                'api/v1/list-columns/*',
                'api/v1/list-actions/*',
                'api/v1/bootstrap-icons/*',
                'api/v1/aux-cor/*',
                'api/v1/calendar-manager/*',
                'api/v1/calendar-manager-view/*',
                'api/v1/calendar-events/*',
                'api/v1/calendar-event-attendees/*',
                'api/v1/calendar-event-reminders/*',
                'api/v1/calendar-event-attachments/*',
                'api/v1/calendar-event-extended-properties/*',
                'api/v1/timeline-manager/*',
                'api/v1/timeline-manager-view/*',
                'api/v1/timeline-posts/*',
                'api/v1/timeline-posts-view/*',
                'api/v1/timeline-post-attachments/*',
                'api/v1/timeline-post-attachments-view/*',
                'api/v1/timeline-post-comments/*',
                'api/v1/timeline-post-comments-view/*',
                'api/v1/timeline-post-reactions/*',
                'api/v1/timeline-post-reactions-view/*',
                'api/v1/timeline-post-ratings/*',
                'api/v1/timeline-post-ratings-view/*',
                'api/v1/timeline-post-reports/*',
                'api/v1/timeline-post-reports-view/*',
                'api/v1/chat-rooms-manager/*',
                'api/v1/chat-rooms-manager-view/*',
                'api/v1/chat-messages/*',
                'api/v1/chat-messages-view/*',
                'api/v1/chat-room-attachments/*',
                'api/v1/chat-room-attachments-view/*',
                'api/v1/chat-room-attachment-reports/*',
                'api/v1/chat-room-attachment-reports-view/*',
                'api/v1/chat-room-warnings/*',
                'api/v1/chat-room-warnings-view/*',
                'api/v1/chat-room-favorites/*',
                'api/v1/chat-room-favorites-view/*',
                'api/v1/chat-room-members/*',
                'api/v1/chat-room-members-view/*',
                'api/v1/messages-manager/*',
                'api/v1/messages-manager-view/*',
                'api/v1/messages-users-view/*',
                'api/v1/message-groups-manager/*',
                'api/v1/message-groups-manager-view/*',
                'api/v1/message-contacts-view/*',
                'api/v1/message-group-reads/*',
                'api/v1/message-group-reads-view/*',
                'api/v1/message-group-chat-view/*',
                'api/v1/message-mentions/*',
                'api/v1/message-mentions-view/*',
                'api/v1/message-warnings/*',
                'api/v1/message-warnings-view/*',
                'api/v1/message-attachments/*',
                'api/v1/message-attachments-view/*',
                'api/v1/message-group-messages/*',
                'api/v1/message-group-messages-view/*',
                'api/v1/message-group-memberships-view/*',
                'api/v1/message-users-groups-view/*',
                'api/v1/message-group-members-view/*',
                'api/v1/message-group-members/*',
                'api/v1/nav-manager/*',
                'api/v1/menu-manager/*',
                'api/v1/db-schema/*',
                'api/v1/route-manager/*',
            ],
        ],
        'adminonly' => [
            'before' => [
                'api/v1/user-manager-view/*',
            ],
        ],
    ];
}
