<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Provedores externos do modulo Map (proxy api/v1/map-geo).
 *
 * O navegador nunca chama estes servicos: o backend chama, aplica cache
 * (map_geocode_cache), espacamento e limite por usuario.
 *
 * Segredos e contato vem do ambiente do container (environment: do servico php
 * no docker-compose.yml, ou SetEnv no .htaccess da KingHost), lidos via env() --
 * mesmo padrao de Config/Email.php. Nada aqui e segredo versionado:
 *   ORS_API_KEY        chave do OpenRouteService (openrouteservice.org)
 *   MAP_CONTACT_EMAIL  contato opcional para o User-Agent do Nominatim
 */
class MapProviders extends BaseConfig
{
    // Nominatim (geocodificacao). Politica do servidor publico: no maximo 1
    // requisicao por segundo, User-Agent identificavel e cache dos resultados.
    public string $nominatimUrl             = 'https://nominatim.openstreetmap.org';
    public string $nominatimUserAgent       = 'projeto54900-multitool/1.0';
    public string $nominatimContact         = '';
    public int $nominatimMinIntervalMs      = 1100;
    public string $defaultCountry           = 'br';

    // OpenRouteService (trajetos e tempo de deslocamento).
    public string $orsUrl                   = 'https://api.openrouteservice.org';
    public string $orsKey                   = '';
    public int $maxRoutePoints              = 50;

    // CEP: ViaCEP principal, BrasilAPI como reserva do texto do endereco.
    public string $viaCepUrl                = 'https://viacep.com.br/ws';
    public string $brasilApiUrl             = 'https://brasilapi.com.br/api';

    // Rede, cache e protecao de cota.
    public int $timeout                     = 8;
    public int $geocodeTtlDays              = 30;
    public int $routeTtlHours               = 24;
    public int $userLimitPerMinute          = 30;

    public function __construct()
    {
        parent::__construct();

        $this->orsKey         = (string) env('ORS_API_KEY', '');
        $this->nominatimContact = (string) env('MAP_CONTACT_EMAIL', '');
    }
}
