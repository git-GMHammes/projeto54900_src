<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Configuracao do JWT de autenticacao (access token + refresh token).
 *
 * Valores lidos de variaveis de ambiente (mesmo padrao de Database.php: sem
 * .env, definidas no docker-compose.yml do servico php e lidas via env()).
 */
class Jwt extends BaseConfig
{
    /** Chave de assinatura HS256 do access token. */
    public string $secret;

    /** Emissor (claim iss) do access token. */
    public string $issuer = 'projeto54900';

    /** Audiencia (claim aud) do access token. */
    public string $audience = 'projeto54900-frontend';

    /** Duracao do access token, em segundos. */
    public int $accessTtl;

    /** Duracao do refresh token, em segundos. */
    public int $refreshTtl;

    public function __construct()
    {
        parent::__construct();

        $this->secret     = (string) env('JWT_SECRET', 'dev-only-change-me');
        $this->accessTtl  = (int) env('JWT_ACCESS_TTL', 900);
        $this->refreshTtl = (int) env('JWT_REFRESH_TTL', 604800);
    }
}
