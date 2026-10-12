<?php

namespace App\Libraries\Map;

/**
 * OpenRouteService: trajeto, distancia e tempo de deslocamento.
 *
 * A chave vem de Config\MapProviders::$orsKey (ambiente ORS_API_KEY) e nunca
 * sai do servidor. Resultado normalizado para as colunas de map_routes e
 * map_route_stops (distance_m, duration_s, geometry GeoJSON, bbox, trechos).
 */
class OrsClient
{
    public const PROFILES = ['driving-car', 'driving-hgv', 'cycling-regular', 'foot-walking'];

    private HttpClient $http;
    private \Config\MapProviders $cfg;

    public function __construct(?HttpClient $http = null)
    {
        $this->http = $http ?? new HttpClient();
        $this->cfg  = config('MapProviders');
    }

    public function configured(): bool
    {
        return $this->cfg->orsKey !== '';
    }

    /**
     * @param list<array{0: float, 1: float}> $coordinates pares [lng, lat], 2 a maxRoutePoints
     *
     * @return array{0: array<string, mixed>, 1: bool} [trajeto, veioDoCache]
     */
    public function directions(string $profile, array $coordinates): array
    {
        if (!$this->configured()) {
            throw new GeoException('OpenRouteService nao configurado: defina ORS_API_KEY no ambiente do servico php', 503);
        }

        $rounded = array_map(static fn(array $c): array => [round($c[0], 6), round($c[1], 6)], $coordinates);
        $key     = $profile . '|' . json_encode($rounded);

        return GeoCache::remember('ors', $key, $this->cfg->routeTtlHours * 3600, function () use ($profile, $rounded): array {
            $response = $this->http->request('POST', $this->cfg->orsUrl . '/v2/directions/' . $profile . '/geojson', [
                'headers' => [
                    'Authorization' => $this->cfg->orsKey,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/geo+json, application/json',
                ],
                'json' => ['coordinates' => $rounded, 'instructions' => false],
            ]);

            return $this->parse($profile, $response);
        });
    }

    /**
     * @param array{status: int, json: ?array, body: string} $response
     *
     * @return array<string, mixed>
     */
    private function parse(string $profile, array $response): array
    {
        $status = $response['status'];
        $json   = $response['json'];

        if ($status === 401 || $status === 403) {
            throw new GeoException('Chave do OpenRouteService invalida ou sem permissao', 502);
        }

        if ($status === 429) {
            throw new GeoException('Limite de consultas do OpenRouteService atingido; tente mais tarde', 429);
        }

        if ($status >= 400) {
            $message = is_array($json['error'] ?? null) ? (string) ($json['error']['message'] ?? '') : '';
            $message = $message !== '' ? $message : 'Nao foi possivel calcular o trajeto';

            throw new GeoException($message, $status < 500 ? 422 : 502);
        }

        $feature = $json['features'][0] ?? null;

        if (!is_array($feature) || !isset($feature['geometry'], $feature['properties']['summary'])) {
            throw new GeoException('Resposta inesperada do OpenRouteService', 502);
        }

        $legs = [];
        foreach (($feature['properties']['segments'] ?? []) as $segment) {
            $legs[] = [
                'distance_m' => (int) round((float) ($segment['distance'] ?? 0)),
                'duration_s' => (int) round((float) ($segment['duration'] ?? 0)),
            ];
        }

        return [
            'profile'    => $profile,
            'provider'   => 'ors',
            'distance_m' => (int) round((float) $feature['properties']['summary']['distance']),
            'duration_s' => (int) round((float) $feature['properties']['summary']['duration']),
            'legs'       => $legs,
            'geometry'   => $feature['geometry'],
            'bbox'       => $json['bbox'] ?? $feature['bbox'] ?? null,
        ];
    }
}
