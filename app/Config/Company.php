<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Configuracao do modulo Company/Companies.
 *
 * Este projeto nao usa .env e o container roda com ENVIRONMENT=production por
 * padrao, entao "modo de desenvolvimento" aqui e decidido pelo HOST da
 * requisicao (mesma ideia do isDevHost() do frontend, config/envHost.ts).
 */
class Company extends BaseConfig
{
    /** Id da empresa DEFAULT (company_manager.id), a que todos os usuarios de dev pertencem. */
    public int $defaultCompanyId = 1;

    /**
     * Hosts tratados como desenvolvimento. Neles, usuario criado sem empresa
     * entra automaticamente na empresa DEFAULT.
     *
     * @var list<string>
     */
    public array $devHosts = ['localhost', '127.0.0.1', '[::1]', '::1'];
}
