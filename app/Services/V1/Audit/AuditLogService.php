<?php

namespace App\Services\V1\Audit;

use App\Libraries\Auth\CurrentUser;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Database;

/**
 * Log de auditoria e acesso: grava e consulta a tabela audit_logs.
 *
 * Le/escreve direto via Query Builder (Database::connect(DB_GROUP_001)), como o AuthService.
 * Gravar NUNCA derruba a requisicao: qualquer falha vai so para o log de arquivo.
 *
 * Duas portas de entrada:
 *   - recordRequest(): linha 'request' de cada chamada da API (AuditFilter, depois da resposta);
 *   - recordEvent(): eventos de sessao (login_ok, login_fail, token_refresh, logout, session_expired,
 *     access_denied, block). Evento explicito suprime a linha 'request' da mesma requisicao.
 *
 * Valores de password/token (config AuditLog::$maskKeys) saem como '***'; o resto e RAW completo.
 */
class AuditLogService
{
    private const TABLE = 'audit_logs';

    /** Acao de negocio por segmento da rota api/v1/<recurso>/<segmento>[/<id>]. */
    private const VERB_ACTIONS = [
        'find'                 => 'search',
        'get-grouped'          => 'search',
        'search'               => 'search',
        'get-all'              => 'search',
        'get-no-pagination'    => 'search',
        'get-deleted-all'      => 'search',
        'get-all-with-deleted' => 'search',
        'get'                  => 'read',
        'get-deleted'          => 'read',
        'get-with-deleted'     => 'read',
        'create'               => 'create',
        'update'               => 'update',
        'delete-soft'          => 'delete',
        'delete-hard'          => 'delete',
        'clear-deleted'        => 'delete',
        'delete-restore'       => 'restore',
    ];

    private const METHOD_ACTIONS = [
        'GET'    => 'read',
        'POST'   => 'create',
        'PUT'    => 'update',
        'PATCH'  => 'update',
        'DELETE' => 'delete',
    ];

    /** Colunas aceitas como filtro exato na consulta. */
    private const SEARCH_EXACT = ['user_id', 'event_type', 'action', 'resource', 'resource_id', 'ip_origin', 'http_method', 'status_code', 'session_id', 'company_id'];

    private const SORTABLE = ['id', 'created_at', 'event_type', 'user_id', 'status_code'];

    /** Ja houve evento explicito neste request? Se sim, a linha generica 'request' nao e gravada. */
    private static bool $eventLogged = false;

    // -------------------------------------------------------------------------
    // Gravacao
    // -------------------------------------------------------------------------

    /** Linha 'request' da chamada autenticada ou publica da API (chamado pelo AuditFilter). */
    public function recordRequest(IncomingRequest $request, ResponseInterface $response): void
    {
        try {
            $cfg    = config('AuditLog');
            $method = strtoupper($request->getMethod());

            if (!$cfg->enabled || self::$eventLogged || $method === 'OPTIONS') {
                return;
            }

            $path     = trim($request->getUri()->getRoutePath(), '/');
            $segments = explode('/', $path);

            // login, refresh e logout viram evento proprio no AuthController.
            if (($segments[2] ?? null) === 'auth' && in_array($segments[3] ?? '', ['login', 'refresh', 'logout'], true)) {
                return;
            }

            foreach ($cfg->excludePaths as $pattern) {
                if (fnmatch($pattern, $path)) {
                    return;
                }
            }

            $verb = $segments[3] ?? '';
            $id   = isset($segments[4]) && ctype_digit($segments[4]) ? $segments[4] : null;

            $action = self::VERB_ACTIONS[$verb] ?? (self::METHOD_ACTIONS[$method] ?? null);
            if ($id !== null && $action === 'search') {
                $action = 'read';
            }

            $body = (string) $response->getBody();
            $json = ($body !== '' && strlen($body) <= 2097152) ? json_decode($body, true) : null;
            $json = is_array($json) ? $json : [];

            $data       = $json['data'] ?? null;
            $responseId = is_array($data) && isset($data['id']) && is_scalar($data['id']) ? (string) $data['id'] : null;
            $details    = ($json['success'] ?? null) === false ? ($json['message'] ?? null) : null;

            $this->insert($this->baseRow($request, 'request') + [
                'action'      => $action,
                'resource'    => $segments[2] ?? null,
                'resource_id' => $id,
                'query_raw'   => $this->queryRaw($request),
                'payload_raw' => $this->payloadRaw($request),
                'response_id' => $responseId,
                'status_code' => $response->getStatusCode(),
                'details'     => is_string($details) ? $details : null,
            ]);
        } catch (\Throwable $e) {
            log_message('error', '[audit] falha ao gravar requisicao: ' . $e->getMessage());
        }
    }

    /**
     * Evento de sessao/seguranca. $extra aceita: user_id, login, company_id, company_slug,
     * status_code, details, session_id. Sem user_id, usa o usuario autenticado do request (CurrentUser).
     *
     * @param array<string,mixed> $extra
     */
    public function recordEvent(string $eventType, array $extra = []): void
    {
        try {
            self::$eventLogged = true;

            if (!config('AuditLog')->enabled) {
                return;
            }

            /** @var IncomingRequest $request */
            $request = service('request');

            $companyId = $extra['company_id'] ?? null;
            if ($companyId === null && !empty($extra['company_slug'])) {
                $companyId = $this->findCompanyIdBySlug((string) $extra['company_slug']);
            }

            $row = $this->baseRow($request, $eventType, isset($extra['user_id']) ? (int) $extra['user_id'] : null, $companyId !== null ? (int) $companyId : null);

            if (!empty($extra['login']) && empty($row['login'])) {
                $row['login'] = mb_substr((string) $extra['login'], 0, 100);
            }

            // Recurso da rota (api/v1/<recurso>/...); 'auth' so quando o evento nasceu em api/v1/auth/*.
            $resource = explode('/', trim($request->getUri()->getRoutePath(), '/'))[2] ?? null;

            $this->insert($row + [
                'action'      => $resource === 'auth' ? 'auth' : null,
                'resource'    => $resource,
                'query_raw'   => $this->queryRaw($request),
                'payload_raw' => $this->payloadRaw($request),
                'status_code' => $extra['status_code'] ?? null,
                'details'     => isset($extra['details']) ? (string) $extra['details'] : null,
            ]);
        } catch (\Throwable $e) {
            log_message('error', '[audit] falha ao gravar evento ' . $eventType . ': ' . $e->getMessage());
        }
    }

    /**
     * Identifica (sem validar assinatura) quem e o dono de um JWT recusado — so para o log. O dado
     * nao e confiavel, por isso quem usa deve marcar isso em details.
     *
     * @return array{user_id:?int,login:?string}
     */
    public function hintFromToken(?string $token): array
    {
        $parts = explode('.', (string) $token);

        if (count($parts) !== 3) {
            return ['user_id' => null, 'login' => null];
        }

        $claims = json_decode((string) base64_decode(strtr($parts[1], '-_', '+/')), true);
        $sub    = is_array($claims) ? ($claims['sub'] ?? null) : null;

        return [
            'user_id' => is_numeric($sub) ? (int) $sub : null,
            'login'   => is_array($claims) && is_string($claims['username'] ?? null) ? $claims['username'] : null,
        ];
    }

    // -------------------------------------------------------------------------
    // Consulta (somente admin — ver Config/Filters.php)
    // -------------------------------------------------------------------------

    /**
     * Filtros: user_id, company_id, event_type, action, resource, resource_id, ip_origin, http_method,
     * status_code, session_id (exatos); login (parcial); date_from/date_to (created_at); q (uri, login,
     * nome, details). Ordenacao fixa por coluna da lista SORTABLE.
     *
     * @param array<string,mixed> $filters
     * @param array{page:int,limit:int,sort:string,order:string} $p
     * @return array{data:list<array<string,mixed>>,pagination:array<string,int>}
     */
    public function search(array $filters, array $p): array
    {
        $b = $this->db()->table(self::TABLE);

        foreach (self::SEARCH_EXACT as $col) {
            if (isset($filters[$col]) && $filters[$col] !== '' && is_scalar($filters[$col])) {
                $b->where($col, $filters[$col]);
            }
        }

        if (!empty($filters['login']) && is_scalar($filters['login'])) {
            $b->like('login', (string) $filters['login']);
        }
        if (!empty($filters['date_from']) && is_scalar($filters['date_from'])) {
            $b->where('created_at >=', (string) $filters['date_from']);
        }
        if (!empty($filters['date_to']) && is_scalar($filters['date_to'])) {
            $b->where('created_at <=', (string) $filters['date_to']);
        }
        if (!empty($filters['q']) && is_scalar($filters['q'])) {
            $b->groupStart()
                ->like('uri', (string) $filters['q'])
                ->orLike('login', (string) $filters['q'])
                ->orLike('full_name', (string) $filters['q'])
                ->orLike('details', (string) $filters['q'])
                ->groupEnd();
        }

        $total = $b->countAllResults(false);
        $sort  = in_array($p['sort'], self::SORTABLE, true) ? $p['sort'] : 'id';
        $order = strtolower($p['order']) === 'asc' ? 'ASC' : 'DESC';

        $rows = $b->orderBy($sort, $order)
            ->limit($p['limit'], ($p['page'] - 1) * $p['limit'])
            ->get()
            ->getResultArray();

        return [
            'data'       => $rows,
            'pagination' => [
                'page'  => $p['page'],
                'limit' => $p['limit'],
                'total' => $total,
                'pages' => (int) ceil($total / max(1, $p['limit'])),
            ],
        ];
    }

    public function find(int $id): ?array
    {
        return $this->db()->table(self::TABLE)->where('id', $id)->get()->getRowArray();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Campos comuns: data/hora, usuario (copia do momento), metodo, uri, IPs, user agent, sessao.
     *
     * @return array<string,mixed>
     */
    private function baseRow(IncomingRequest $request, string $eventType, ?int $userId = null, ?int $companyId = null): array
    {
        $claims    = CurrentUser::claims();
        $userId    ??= CurrentUser::id();
        $companyId ??= CurrentUser::companyId();
        $sid       = (string) ($claims['sid'] ?? '');

        $row = [
            'created_at'     => date('Y-m-d H:i:s'),
            'event_type'     => $eventType,
            'user_id'        => $userId,
            'login'          => isset($claims['username']) && $userId === CurrentUser::id() ? (string) $claims['username'] : null,
            'full_name'      => null,
            'profile'        => null,
            'company_id'     => $companyId,
            'company_name'   => null,
            'http_method'    => strtoupper($request->getMethod()),
            'uri'            => mb_substr('/' . trim($request->getUri()->getRoutePath(), '/'), 0, 500),
            'ip_origin'      => $request->getIPAddress(),
            'ip_destination' => $request->getServer('SERVER_ADDR') ?: null,
            'user_agent'     => mb_substr((string) $request->getUserAgent(), 0, 500) ?: null,
            // Somente o prefixo do sid (hash do refresh token): identifica a sessao sem expor o valor inteiro.
            'session_id'     => $sid !== '' && $userId === CurrentUser::id() ? substr($sid, 0, 12) : null,
        ];

        if ($userId !== null) {
            $row = array_merge($row, $this->snapshotUser($userId, $companyId));
        }

        return $row;
    }

    /**
     * Login, nome completo, perfil e empresa do usuario NO MOMENTO do evento — se o cadastro mudar
     * depois, o historico continua mostrando o que valia na hora.
     *
     * @return array<string,?string>
     */
    private function snapshotUser(int $userId, ?int $companyId): array
    {
        $row = $this->db()->table('user_manager um')
            ->select('um.username, up.name AS full_name, ur.name AS role_name, co.name AS company_name')
            ->join('user_profiles up', 'up.user_manager_id = um.id AND up.deleted_at IS NULL', 'left')
            ->join('user_roles ur', 'ur.id = um.user_role_id', 'left')
            ->join('company_manager co', 'co.id = ' . (int) $companyId, 'left')
            ->where('um.id', $userId)
            ->limit(1)
            ->get()
            ->getRowArray();

        if ($row === null) {
            return [];
        }

        return [
            'login'        => $row['username'],
            'full_name'    => $row['full_name'],
            'profile'      => $row['role_name'],
            'company_name' => $row['company_name'],
        ];
    }

    private function findCompanyIdBySlug(string $slug): ?int
    {
        $row = $this->db()->table('company_manager')->select('id')->where('slug', $slug)->get()->getRowArray();

        return $row !== null ? (int) $row['id'] : null;
    }

    /** Querystring bruta da busca, com os valores de chaves sensiveis mascarados. */
    private function queryRaw(IncomingRequest $request): ?string
    {
        $query = $request->getUri()->getQuery();

        if ($query === '') {
            return null;
        }

        $keys  = implode('|', array_map(static fn (string $k): string => preg_quote($k, '/'), config('AuditLog')->maskKeys));
        $query = preg_replace('/(^|&)(' . $keys . ')=[^&]*/i', '$1$2=***', $query) ?? $query;

        return $this->truncate($query);
    }

    /**
     * Corpo bruto de POST/PUT/PATCH/DELETE. JSON e form-urlencoded saem como JSON com as chaves
     * sensiveis mascaradas; multipart grava os campos e os metadados dos arquivos (nunca o binario).
     */
    private function payloadRaw(IncomingRequest $request): ?string
    {
        if (in_array(strtoupper($request->getMethod()), ['GET', 'HEAD'], true)) {
            return null;
        }

        $contentType = strtolower($request->getHeaderLine('Content-Type'));

        if (str_contains($contentType, 'multipart/form-data')) {
            return $this->truncate($this->encode([
                'fields' => $this->mask($request->getPost() ?: []),
                'files'  => $this->filesMeta($request->getFiles()),
            ]));
        }

        $raw = (string) $request->getBody();

        if ($raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $this->truncate($this->encode($this->mask($decoded)));
        }

        if (str_contains($contentType, 'application/x-www-form-urlencoded')) {
            parse_str($raw, $fields);

            return $this->truncate($this->encode($this->mask($fields)));
        }

        return $this->truncate($raw);
    }

    /**
     * @param array<mixed> $files
     * @return array<mixed>
     */
    private function filesMeta(array $files): array
    {
        $meta = [];

        foreach ($files as $key => $file) {
            $meta[$key] = is_array($file)
                ? $this->filesMeta($file)
                : ['name' => $file->getClientName(), 'type' => $file->getClientMimeType(), 'size' => $file->getSize()];
        }

        return $meta;
    }

    private function mask(mixed $data): mixed
    {
        if (!is_array($data)) {
            return $data;
        }

        $keys = config('AuditLog')->maskKeys;

        foreach ($data as $key => $value) {
            $data[$key] = is_string($key) && in_array(strtolower($key), $keys, true) ? '***' : $this->mask($value);
        }

        return $data;
    }

    private function encode(mixed $data): string
    {
        return (string) json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR);
    }

    private function truncate(string $text): string
    {
        $max = config('AuditLog')->maxPayloadBytes;

        return strlen($text) > $max ? mb_strcut($text, 0, $max, 'UTF-8') . ' ...[truncado]' : $text;
    }

    /** @param array<string,mixed> $row */
    private function insert(array $row): void
    {
        $this->db()->table(self::TABLE)->insert($row);
    }

    private function db(): \CodeIgniter\Database\BaseConnection
    {
        return Database::connect(DB_GROUP_001);
    }
}
