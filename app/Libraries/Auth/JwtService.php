<?php

namespace App\Libraries\Auth;

use Config\Jwt as JwtConfig;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Emissao/validacao dos tokens de autenticacao (HS256, via firebase/php-jwt).
 *
 * access_token: TTL curto (Jwt::$accessTtl), claim "typ"="access".
 * refresh_token: TTL longo (Jwt::$refreshTtl), claim "typ"="refresh". O hash
 * sha256 do refresh token emitido e o unico guardado em user_manager.token
 * (coluna ja existente) — cada refresh/login sobrescreve o hash anterior, o
 * que revoga automaticamente qualquer refresh token emitido antes (rotacao).
 */
class JwtService
{
    private JwtConfig $config;

    public function __construct()
    {
        $this->config = config('Jwt');
    }

    /**
     * @param array{sub:int,username:string,role_id:?int,role_slug:?string} $claims
     */
    public function issueAccessToken(array $claims): string
    {
        $now = time();

        return $this->encode([
            'iss'       => $this->config->issuer,
            'aud'       => $this->config->audience,
            'iat'       => $now,
            'exp'       => $now + $this->config->accessTtl,
            'typ'       => 'access',
            'sub'       => $claims['sub'],
            'username'  => $claims['username'],
            'role_id'   => $claims['role_id'],
            'role_slug' => $claims['role_slug'],
        ]);
    }

    /**
     * @param array{sub:int} $claims
     */
    public function issueRefreshToken(array $claims): string
    {
        $now = time();

        return $this->encode([
            'iss' => $this->config->issuer,
            'aud' => $this->config->audience,
            'iat' => $now,
            'exp' => $now + $this->config->refreshTtl,
            'typ' => 'refresh',
            'sub' => $claims['sub'],
        ]);
    }

    public function accessTtlSeconds(): int
    {
        return $this->config->accessTtl;
    }

    /**
     * Decodifica e valida assinatura/expiracao/issuer/audience de qualquer um
     * dos dois tipos de token. Retorna null em qualquer falha (expirado,
     * assinatura invalida, malformado, iss/aud incorretos).
     */
    public function decode(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->config->secret, 'HS256'));
            $claims  = (array) $decoded;

            if (($claims['iss'] ?? null) !== $this->config->issuer) {
                return null;
            }
            if (($claims['aud'] ?? null) !== $this->config->audience) {
                return null;
            }

            return $claims;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Hash de armazenamento do refresh token (nunca o valor cru). */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    private function encode(array $payload): string
    {
        return JWT::encode($payload, $this->config->secret, 'HS256');
    }
}
