<?php

namespace App\Services\V1\Auth;

use App\Libraries\Auth\JwtService;
use Config\Database;

/**
 * Regras de negocio do login/refresh/logout/me.
 *
 * Le/escreve direto via Query Builder em user_manager/user_roles (Database::
 * connect(DB_GROUP_001)), como Processor::userRoleExiste() ja faz — o Model
 * (SqlTableModel) remove password_hash/token de toda leitura via afterFind
 * ($hidden), mas este service PRECISA desses dois campos (password_verify e
 * comparacao do refresh token), entao usa o builder cru, nao o Model.
 */
class AuthService
{
    /**
     * Janela (em segundos) em que o refresh token ANTERIOR ainda e aceito apos uma troca. Cobre a resposta perdida
     * (F5, aba fechada ou navegacao no meio do refresh): sem isso o navegador volta com o token ja trocado, o
     * servidor recusa e a sessao cai. Ver Database/Migrations/202610190200_user_refresh_grace.sql.
     */
    private const REFRESH_GRACE_SECONDS = 30;

    private JwtService $jwt;

    public function __construct()
    {
        $this->jwt = new JwtService();
    }

    /** Resposta UNICA para qualquer falha de login (nunca revela o motivo). */
    private const LOGIN_FAIL_MESSAGE = 'Usuário ou senha inválidos';

    /**
     * Login por empresa: o endereco e auto declarado (/<slug-empresa>/v1/login) e o slug chega em
     * $companySlug; sem slug, vale a empresa DEFAULT. So entra quem tem o id da empresa em
     * user_manager.company_ids.
     *
     * Toda falha — usuario inexistente, senha errada, usuario inativo/bloqueado, empresa que nao
     * existe, usuario sem acesso a empresa — devolve a MESMA resposta (401 + LOGIN_FAIL_MESSAGE).
     * O motivo real vai so para o log do servidor.
     *
     * @return array{success:bool,message?:string,code?:int,data?:array}
     */
    public function login(string $username, string $password, string $ip, ?string $companySlug = null): array
    {
        $user = $this->findActiveByUsername($username);

        // Sem usuario, ainda assim gasta um bcrypt do mesmo custo: o tempo de resposta nao
        // diferencia "usuario nao existe" de "senha errada".
        $passwordOk = $user !== null
            ? password_verify($password, (string) $user['password_hash'])
            : (password_hash($password, PASSWORD_BCRYPT) === '');

        $reason = null;
        if ($user === null || !$passwordOk) {
            $reason = 'credenciais invalidas';
        } elseif ($user['status'] !== 'active') {
            $reason = "status={$user['status']}";
        } else {
            $companyId = $this->resolveLoginCompanyId($companySlug);
            if ($companyId === null) {
                $reason = 'empresa inexistente/inativa';
            } elseif (!$this->userCanAccessCompany($user, $companyId)) {
                $reason = "sem acesso a empresa id={$companyId}";
            }
        }

        if ($reason !== null) {
            log_message('warning', "[auth] login falhou ({$reason}) username='{$username}' empresa='" . ($companySlug ?? 'default') . "' ip={$ip}");

            return ['success' => false, 'message' => self::LOGIN_FAIL_MESSAGE, 'code' => 401];
        }

        $tokens = $this->issueTokenPair((int) $user['id'], $user['username'], (int) ($user['user_role_id'] ?? 0) ?: null, $ip, $companyId);

        $this->db()->table('user_manager')
            ->where('id', $user['id'])
            ->update([
                'token'            => $tokens['sid'],
                'token_prev'       => null,
                'token_prev_until' => null,
                'last_login_at'    => date('Y-m-d H:i:s'),
            ]);

        log_message('info', "[auth] login ok para username='{$username}' empresa='" . ($companySlug ?? 'default') . "' ip={$ip}");

        $payload = $this->buildAuthPayload((int) $user['id'], $tokens, $companyId);
        // Empresa pela qual o usuario entrou: o front monta a URL pos-login com este slug.
        $payload['company_slug'] = $this->findCompanySlugById($companyId);

        return ['success' => true, 'data' => $payload];
    }

    /** Id da empresa ativa do slug informado (null/vazio = DEFAULT); null se nao existir, inativa ou slug malformado. */
    private function resolveLoginCompanyId(?string $slug): ?int
    {
        $slug = $slug === null ? '' : trim($slug);

        if ($slug === '') {
            return (int) config('Company')->defaultCompanyId;
        }

        if (strlen($slug) > 100 || preg_match('/^[a-z0-9-]+$/', $slug) !== 1) {
            return null;
        }

        $row = $this->db()->table('company_manager')
            ->select('id')
            ->where('slug', $slug)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        return $row !== null ? (int) $row['id'] : null;
    }

    private function findCompanySlugById(int $companyId): ?string
    {
        $row = $this->db()->table('company_manager')->select('slug')->where('id', $companyId)->get()->getRowArray();

        return $row['slug'] ?? null;
    }

    /**
     * @return array{success:bool,message?:string,code?:int,data?:array}
     */
    public function refresh(string $refreshToken, string $ip): array
    {
        $claims = $this->jwt->decode($refreshToken);

        if ($claims === null || ($claims['typ'] ?? null) !== 'refresh') {
            return ['success' => false, 'message' => 'Refresh token inválido ou expirado', 'code' => 401];
        }

        $user = $this->findActiveById((int) $claims['sub']);

        if ($user === null || $user['status'] !== 'active') {
            return ['success' => false, 'message' => 'Usuário não encontrado ou inativo', 'code' => 401];
        }

        $hash       = $this->jwt->hashToken($refreshToken);
        $isCurrent  = !empty($user['token']) && hash_equals((string) $user['token'], $hash);
        $isPrevious = !empty($user['token_prev'])
            && !empty($user['token_prev_until'])
            && strtotime((string) $user['token_prev_until']) >= time()
            && hash_equals((string) $user['token_prev'], $hash);

        if (!$isCurrent && !$isPrevious) {
            return ['success' => false, 'message' => 'Refresh token não confere (já usado ou revogado)', 'code' => 401];
        }

        // A sessao e amarrada a empresa do login (claim cid): o refresh a mantem e so renova se o
        // usuario ainda tem acesso a ela. Token sem cid (anterior a esta regra) exige novo login.
        $companyId = (int) ($claims['cid'] ?? 0);
        if ($companyId <= 0 || !$this->userCanAccessCompany($user, $companyId)) {
            return ['success' => false, 'message' => 'Refresh token inválido ou expirado', 'code' => 401];
        }

        $tokens = $this->issueTokenPair((int) $user['id'], $user['username'], (int) ($user['user_role_id'] ?? 0) ?: null, $ip, $companyId);

        // O token usado vira o "anterior" por REFRESH_GRACE_SECONDS: se esta resposta se perder, o cliente ainda troca de novo.
        $this->db()->table('user_manager')
            ->where('id', $user['id'])
            ->update([
                'token'            => $tokens['sid'],
                'token_prev'       => $hash,
                'token_prev_until' => date('Y-m-d H:i:s', time() + self::REFRESH_GRACE_SECONDS),
            ]);

        return ['success' => true, 'data' => $this->buildAuthPayload((int) $user['id'], $tokens, $companyId)];
    }

    /**
     * Revoga a sessao do usuario (token NULL): o refresh token deixa de trocar
     * e o access token do par deixa de passar no JwtAuthFilter (sid sem par).
     */
    public function logout(int $userId): void
    {
        $this->db()->table('user_manager')->where('id', $userId)->update(['token' => null, 'token_prev' => null, 'token_prev_until' => null]);
    }

    /**
     * Bloqueia a PROPRIA conta (status='blocked', mesmo valor usado pelo botao
     * de bloqueio do admin em user-manager). Chamado pelo frontend quando o
     * usuario insiste em acessar uma rota sem permissao (ver ForbiddenPage) --
     * so aceita o id do CurrentUser, nunca um id arbitrario. status='blocked'
     * ja derruba a sessao na proxima checagem (AuthService::sessionActive exige
     * status='active'), entao nao precisa zerar o token aqui.
     *
     * @return array{success:bool,message?:string,code?:int}
     */
    public function selfBlock(int $userId): array
    {
        $user = $this->findActiveById($userId);

        if ($user === null) {
            return ['success' => false, 'message' => 'Usuário não encontrado', 'code' => 404];
        }

        $this->db()->table('user_manager')
            ->where('id', $userId)
            ->update(['status' => 'blocked']);

        log_message('warning', "[auth] auto-bloqueio (tentativas repetidas de acesso negado) para user_id={$userId}");

        return ['success' => true];
    }

    /**
     * Identifica de quem e a sessao a encerrar. Tenta o access token (Bearer)
     * com sessao ainda ativa; se ausente/expirado, cai para o refresh token do
     * corpo, que precisa conferir com o hash gravado. Null = nada a revogar.
     */
    public function resolveLogoutUserId(?string $accessToken, ?string $refreshToken): ?int
    {
        if ($accessToken !== null && $accessToken !== '') {
            $claims = $this->jwt->decode($accessToken);
            if ($claims !== null && ($claims['typ'] ?? null) === 'access'
                && $this->sessionActive((int) $claims['sub'], (string) ($claims['sid'] ?? ''))) {
                return (int) $claims['sub'];
            }
        }

        if ($refreshToken !== null && $refreshToken !== '') {
            $claims = $this->jwt->decode($refreshToken);
            if ($claims !== null && ($claims['typ'] ?? null) === 'refresh'
                && $this->sessionActive((int) $claims['sub'], $this->jwt->hashToken($refreshToken))) {
                return (int) $claims['sub'];
            }
        }

        return null;
    }

    /**
     * Sessao ativa = usuario ativo, nao excluido, e sid igual ao hash do
     * refresh token gravado em user_manager.token. Usado pelo JwtAuthFilter.
     */
    public function sessionActive(int $userId, string $sid, ?int $companyId = null): bool
    {
        if ($userId <= 0 || $sid === '') {
            return false;
        }

        $user = $this->findActiveById($userId);

        if ($user === null
            || $user['status'] !== 'active'
            || empty($user['token'])
            || !hash_equals((string) $user['token'], $sid)) {
            return false;
        }

        // $companyId so e informado pelo JwtAuthFilter (rotas protegidas): a sessao morre se a
        // empresa do login nao existe mais/foi inativada ou o usuario perdeu o acesso a ela.
        // Logout nao informa: sempre consegue encerrar a propria sessao.
        return $companyId === null || ($companyId > 0 && $this->userCanAccessCompany($user, $companyId));
    }

    /**
     * O usuario tem vinculo ATIVO (company_members.status = 'active': aprovado e nao bloqueado) com a
     * empresa E a empresa esta ativa e nao excluida. 'pending' e 'blocked' nao entram.
     */
    private function userCanAccessCompany(array $user, int $companyId): bool
    {
        $member = $this->db()->table('company_members')
            ->where('company_id', $companyId)
            ->where('user_manager_id', (int) $user['id'])
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->countAllResults() > 0;

        if (!$member) {
            return false;
        }

        return $this->db()->table('company_manager')
            ->where('id', $companyId)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }

    /**
     * @return array{success:bool,message?:string,code?:int,data?:array}
     */
    public function me(int $userId, ?int $companyId = null): array
    {
        $user = $this->findActiveById($userId);

        if ($user === null) {
            return ['success' => false, 'message' => 'Usuário não encontrado', 'code' => 404];
        }

        return ['success' => true, 'data' => $this->userPublicData($user, $companyId)];
    }

    /**
     * Troca a própria senha do usuário autenticado. Exige a senha atual
     * correta; ao trocar, invalida o token atual (user_manager.token NULL),
     * forçando novo login — mesmo efeito de logout().
     *
     * @return array{success:bool,message?:string,code?:int}
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): array
    {
        $user = $this->findActiveById($userId);

        if ($user === null) {
            return ['success' => false, 'message' => 'Usuário não encontrado', 'code' => 404];
        }

        if (!password_verify($currentPassword, (string) $user['password_hash'])) {
            return ['success' => false, 'message' => 'Senha atual incorreta', 'code' => 401];
        }

        $this->db()->table('user_manager')
            ->where('id', $userId)
            ->update([
                'password_hash'    => password_hash($newPassword, PASSWORD_BCRYPT),
                'token'            => null,
                'token_prev'       => null,
                'token_prev_until' => null,
            ]);

        log_message('info', "[auth] senha alterada para user_id={$userId}");

        return ['success' => true];
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function issueTokenPair(int $userId, string $username, ?int $roleId, string $ip, int $companyId): array
    {
        $role = $roleId !== null ? $this->findRole($roleId) : null;

        // Refresh primeiro: o hash dele vira o sid do access token e o valor
        // gravado em user_manager.token (os dois tokens nascem pareados).
        $refreshToken = $this->jwt->issueRefreshToken(['sub' => $userId, 'cid' => $companyId]);
        $sid          = $this->jwt->hashToken($refreshToken);

        $accessToken = $this->jwt->issueAccessToken([
            'sub'         => $userId,
            'username'    => $username,
            'role_id'     => $roleId,
            'role_slug'   => $role['slug'] ?? null,
            'remote_addr' => $ip,
            'sid'         => $sid,
            'cid'         => $companyId,
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => $this->jwt->accessTtlSeconds(),
            'sid'           => $sid,
        ];
    }

    private function buildAuthPayload(int $userId, array $tokens, int $companyId): array
    {
        $user = $this->findActiveById($userId);

        return [
            'access_token'  => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $tokens['expires_in'],
            'user'          => $user !== null ? $this->userPublicData($user, $companyId) : null,
        ];
    }

    private function userPublicData(array $user, ?int $companyId = null): array
    {
        $roleId = (int) ($user['user_role_id'] ?? 0) ?: null;
        $role   = $roleId !== null ? $this->findRole($roleId) : null;

        return [
            'id'            => (int) $user['id'],
            'username'      => $user['username'],
            'full_name'     => $this->findProfileName((int) $user['id']),
            'status'        => $user['status'],
            'last_login_at' => $user['last_login_at'],
            'role'          => $role !== null ? [
                'id'   => (int) $role['id'],
                'name' => $role['name'],
                'slug' => $role['slug'],
            ] : null,
            'companies'     => $this->findCompanies((int) $user['id']),
            // Empresa a que a SESSAO esta amarrada (a do login); o front so aceita esta na URL.
            'company_slug'  => $companyId !== null ? $this->findCompanySlugById($companyId) : null,
        ];
    }

    /**
     * Empresas ativas a que o usuario tem vinculo ATIVO (company_members). Sem vinculo valido -> lista vazia.
     *
     * @return list<array{id:int,name:string,slug:string}>
     */
    private function findCompanies(int $userId): array
    {
        $rows = $this->db()->table('company_members cm')
            ->select('co.id, co.name, co.slug')
            ->join('company_manager co', 'co.id = cm.company_id')
            ->where('cm.user_manager_id', $userId)
            ->where('cm.status', 'active')
            ->where('cm.deleted_at', null)
            ->where('co.status', 'active')
            ->where('co.deleted_at', null)
            ->orderBy('co.id')
            ->get()
            ->getResultArray();

        return array_map(static fn (array $r): array => [
            'id'   => (int) $r['id'],
            'name' => (string) $r['name'],
            'slug' => (string) $r['slug'],
        ], $rows);
    }

    /** Nome completo (user_profiles.name) do user_manager informado, ou null se não tiver perfil. */
    private function findProfileName(int $userManagerId): ?string
    {
        $profile = $this->db()->table('user_profiles')
            ->select('name')
            ->where('user_manager_id', $userManagerId)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        return $profile['name'] ?? null;
    }

    private function findActiveByUsername(string $username): ?array
    {
        return $this->db()->table('user_manager')
            ->where('username', $username)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();
    }

    private function findActiveById(int $id): ?array
    {
        return $this->db()->table('user_manager')
            ->where('id', $id)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();
    }

    private function findRole(int $id): ?array
    {
        return $this->db()->table('user_roles')
            ->where('id', $id)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();
    }

    private function db(): \CodeIgniter\Database\BaseConnection
    {
        return Database::connect(DB_GROUP_001);
    }
}
