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
                'token'         => $this->jwt->hashToken($tokens['refresh_token']),
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
            ->update(['token' => $this->jwt->hashToken($tokens['refresh_token'])]);

        return ['success' => true, 'data' => $this->buildAuthPayload((int) $user['id'], $tokens)];
    }

    public function logout(int $userId): void
    {
        $this->db()->table('user_manager')->where('id', $userId)->update(['token' => null]);
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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function issueTokenPair(int $userId, string $username, ?int $roleId, string $ip): array
    {
        $role = $roleId !== null ? $this->findRole($roleId) : null;

        $accessToken = $this->jwt->issueAccessToken([
            'sub'         => $userId,
            'username'    => $username,
            'role_id'     => $roleId,
            'role_slug'   => $role['slug'] ?? null,
            'remote_addr' => $ip,
        ]);

        $refreshToken = $this->jwt->issueRefreshToken(['sub' => $userId]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => $this->jwt->accessTtlSeconds(),
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
            'status'        => $user['status'],
            'last_login_at' => $user['last_login_at'],
            'role'          => $role !== null ? [
                'id'   => (int) $role['id'],
                'name' => $role['name'],
                'slug' => $role['slug'],
            ] : null,
        ];
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
