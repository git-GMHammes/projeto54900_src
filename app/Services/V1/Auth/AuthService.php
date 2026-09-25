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
    private JwtService $jwt;

    public function __construct()
    {
        $this->jwt = new JwtService();
    }

    /**
     * @return array{success:bool,message?:string,code?:int,data?:array}
     */
    public function login(string $username, string $password, string $ip): array
    {
        $user = $this->findActiveByUsername($username);

        if ($user === null || !password_verify($password, (string) $user['password_hash'])) {
            log_message('warning', "[auth] login falhou para username='{$username}' ip={$ip}");

            return ['success' => false, 'message' => 'Usuário ou senha inválidos', 'code' => 401];
        }

        if ($user['status'] !== 'active') {
            log_message('warning', "[auth] login bloqueado (status={$user['status']}) para username='{$username}' ip={$ip}");

            return ['success' => false, 'message' => 'Usuário inativo ou bloqueado', 'code' => 403];
        }

        $tokens = $this->issueTokenPair((int) $user['id'], $user['username'], (int) ($user['user_role_id'] ?? 0) ?: null, $ip);

        $this->db()->table('user_manager')
            ->where('id', $user['id'])
            ->update([
                'token'         => $tokens['sid'],
                'last_login_at' => date('Y-m-d H:i:s'),
            ]);

        log_message('info', "[auth] login ok para username='{$username}' ip={$ip}");

        return ['success' => true, 'data' => $this->buildAuthPayload((int) $user['id'], $tokens)];
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

        if (empty($user['token']) || !hash_equals((string) $user['token'], $this->jwt->hashToken($refreshToken))) {
            return ['success' => false, 'message' => 'Refresh token não confere (já usado ou revogado)', 'code' => 401];
        }

        $tokens = $this->issueTokenPair((int) $user['id'], $user['username'], (int) ($user['user_role_id'] ?? 0) ?: null, $ip);

        $this->db()->table('user_manager')
            ->where('id', $user['id'])
            ->update(['token' => $tokens['sid']]);

        return ['success' => true, 'data' => $this->buildAuthPayload((int) $user['id'], $tokens)];
    }

    /**
     * Revoga a sessao do usuario (token NULL): o refresh token deixa de trocar
     * e o access token do par deixa de passar no JwtAuthFilter (sid sem par).
     */
    public function logout(int $userId): void
    {
        $this->db()->table('user_manager')->where('id', $userId)->update(['token' => null]);
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
    public function sessionActive(int $userId, string $sid): bool
    {
        if ($userId <= 0 || $sid === '') {
            return false;
        }

        $user = $this->findActiveById($userId);

        return $user !== null
            && $user['status'] === 'active'
            && !empty($user['token'])
            && hash_equals((string) $user['token'], $sid);
    }

    /**
     * @return array{success:bool,message?:string,code?:int,data?:array}
     */
    public function me(int $userId): array
    {
        $user = $this->findActiveById($userId);

        if ($user === null) {
            return ['success' => false, 'message' => 'Usuário não encontrado', 'code' => 404];
        }

        return ['success' => true, 'data' => $this->userPublicData($user)];
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
                'password_hash' => password_hash($newPassword, PASSWORD_BCRYPT),
                'token'         => null,
            ]);

        log_message('info', "[auth] senha alterada para user_id={$userId}");

        return ['success' => true];
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function issueTokenPair(int $userId, string $username, ?int $roleId, string $ip): array
    {
        $role = $roleId !== null ? $this->findRole($roleId) : null;

        // Refresh primeiro: o hash dele vira o sid do access token e o valor
        // gravado em user_manager.token (os dois tokens nascem pareados).
        $refreshToken = $this->jwt->issueRefreshToken(['sub' => $userId]);
        $sid          = $this->jwt->hashToken($refreshToken);

        $accessToken = $this->jwt->issueAccessToken([
            'sub'         => $userId,
            'username'    => $username,
            'role_id'     => $roleId,
            'role_slug'   => $role['slug'] ?? null,
            'remote_addr' => $ip,
            'sid'         => $sid,
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => $this->jwt->accessTtlSeconds(),
            'sid'           => $sid,
        ];
    }

    private function buildAuthPayload(int $userId, array $tokens): array
    {
        $user = $this->findActiveById($userId);

        return [
            'access_token'  => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $tokens['expires_in'],
            'user'          => $user !== null ? $this->userPublicData($user) : null,
        ];
    }

    private function userPublicData(array $user): array
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
        ];
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
