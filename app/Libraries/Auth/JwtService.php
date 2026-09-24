<?php

namespace App\Libraries\Auth;

use Config\Jwt as JwtConfig;

/**
 * Emissao/validacao dos tokens de autenticacao (HS256, implementacao nativa
 * do PHP via hash_hmac — sem biblioteca externa/Composer).
 *
 * access_token: TTL curto (Jwt::$accessTtl), claim "typ"="access".
 * refresh_token: TTL longo (Jwt::$refreshTtl), claim "typ"="refresh". O hash
 * sha256 do refresh token emitido e o unico guardado em user_manager.token
 * (coluna ja existente) — cada refresh/login sobrescreve o hash anterior, o
 * que revoga automaticamente qualquer refresh token emitido antes (rotacao).
 *
 * O access token carrega "sid" = esse mesmo hash do refresh token do par. O
 * JwtAuthFilter so aceita o access token enquanto sid === user_manager.token:
 * logout (token NULL) ou novo login/refresh (hash novo) derrubam na hora o
 * access token anterior, sem esperar o exp.
 */
class JwtService
{
    private JwtConfig $config;

    public function __construct()
    {
        $this->config = config('Jwt');
    }

    /**
     * @param array{sub:int,username:string,role_id:?int,role_slug:?string,remote_addr:string,sid:string} $claims
     */
    public function issueAccessToken(array $claims): string
    {
        $now  = time();
        $role = (string) ($claims['role_slug'] ?? '');
        $ip   = (string) ($claims['remote_addr'] ?? '');

        return $this->encode([
            'iss'         => $this->config->issuer,
            'aud'         => $this->config->audience,
            'iat'         => $now,
            'exp'         => $now + $this->config->accessTtl,
            'typ'         => 'access',
            'sub'         => $claims['sub'],
            'username'    => $claims['username'],
            'role'        => $claims['role_slug'],
            'remote_addr' => $claims['remote_addr'],
            'sid'         => $claims['sid'],
            // Enigma de ofuscacao (distracao ao curioso), sem uso em validacao.
            'geheimnis'   => md5($role . $ip . date('d')),
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
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $expectedSignature = $this->sign($headerB64 . '.' . $payloadB64);
        $signature         = $this->base64UrlDecode($signatureB64);

        if ($signature === false || ! hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payloadJson = $this->base64UrlDecode($payloadB64);

        if ($payloadJson === false) {
            return null;
        }

        $claims = json_decode($payloadJson, true);

        if (! is_array($claims)) {
            return null;
        }

        if (($claims['exp'] ?? 0) < time()) {
            return null;
        }
        if (($claims['iss'] ?? null) !== $this->config->issuer) {
            return null;
        }
        if (($claims['aud'] ?? null) !== $this->config->audience) {
            return null;
        }

        return $claims;
    }

    /** Hash de armazenamento do refresh token (nunca o valor cru). */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    private function encode(array $payload): string
    {
        $headerB64  = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256'], JSON_UNESCAPED_SLASHES));
        $payloadB64 = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature  = $this->sign($headerB64 . '.' . $payloadB64);

        return $headerB64 . '.' . $payloadB64 . '.' . $this->base64UrlEncode($signature);
    }

    private function sign(string $data): string
    {
        return hash_hmac('sha256', $data, $this->config->secret, true);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string|false
    {
        $padded = str_pad($data, strlen($data) + (4 - strlen($data) % 4) % 4, '=');

        return base64_decode(strtr($padded, '-_', '+/'), true);
    }
}
