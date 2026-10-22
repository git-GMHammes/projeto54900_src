<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Parametros do log de auditoria e acesso (tabela audit_logs).
 * Gravacao em App\Services\V1\Audit\AuditLogService; captura de requisicoes em
 * App\Filters\AuditFilter.
 */
class AuditLog extends BaseConfig
{
    /** Liga/desliga toda a gravacao (a consulta admin continua funcionando). */
    public bool $enabled = true;

    /** Limite do payload_raw/query_raw gravado; acima disso o texto e cortado e marcado. */
    public int $maxPayloadBytes = 1048576;

    /**
     * Rotas que NAO geram registro de requisicao (padrao fnmatch, sem barra inicial),
     * ex.: 'api/v1/messages-users-view/*' para tirar polling do log. Vazio = audita tudo.
     *
     * @var list<string>
     */
    public array $excludePaths = [];

    /**
     * Chaves cujo valor e gravado como '***' em qualquer nivel do corpo/querystring
     * (comparacao sem diferenciar maiusculas). Todo o resto vai em RAW completo.
     *
     * @var list<string>
     */
    public array $maskKeys = [
        'password',
        'current_password',
        'new_password',
        'password_confirmation',
        'password_confirm',
        'confirm_password',
        'password_hash',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'secret',
        'api_key',
    ];
}
