<?php

namespace App\Libraries\Map;

use Config\Services;

/**
 * Cliente HTTP minimo dos provedores (curlrequest do CI4, sem biblioteca externa).
 *
 * $fake permite testar sem rede: callable(method, url, options) devolvendo o
 * mesmo array de request(). Fica null em producao.
 */
class HttpClient
{
    /** @var (callable(string, string, array<string, mixed>): array{status: int, json: ?array, body: string})|null */
    public static $fake = null;

    /**
     * @param array<string, mixed> $options headers, query, json
     *
     * @return array{status: int, json: ?array, body: string}
     */
    public function request(string $method, string $url, array $options = []): array
    {
        if (self::$fake !== null) {
            return (self::$fake)($method, $url, $options);
        }

        $cfg    = config('MapProviders');
        $client = Services::curlrequest([
            'timeout'         => $cfg->timeout,
            'connect_timeout' => 5,
            'http_errors'     => false,
        ]);

        try {
            $response = $client->request($method, $url, $options + ['http_errors' => false]);
        } catch (\Throwable $e) {
            throw new GeoException('Provedor de mapa indisponivel no momento', 503);
        }

        $body = (string) $response->getBody();
        $json = json_decode($body, true);

        return [
            'status' => $response->getStatusCode(),
            'json'   => is_array($json) ? $json : null,
            'body'   => $body,
        ];
    }
}
