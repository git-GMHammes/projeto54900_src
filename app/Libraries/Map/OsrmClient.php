<?php

namespace App\Libraries\Map;

/**
 * OSRM (servidor publico do projeto OSM): reserva do OpenRouteService quando ele
 * esta fora do ar. So atende carro (o demo publico ignora o perfil) e nao tem
 * garantia de disponibilidade; sem chave. Devolve o mesmo formato do OrsClient
 * (provider = 'osrm') para map_routes / map_route_stops.
 */
class OsrmClient
{
    public const PROFILES = ['driving-car'];

    private HttpClient $http;
    private \Config\MapProviders $cfg;

    public function __construct(?HttpClient $http = null)
    {
        $this->http = $http ?? new HttpClient();
        $this->cfg  = config('MapProviders');
    }

    public function supports(string $profile): bool
    {
        return in_array($profile, self::PROFILES, true);
    }

    /**
     * @param list<array{0: float, 1: float}> $coordinates pares [lng, lat]
     *
     * @return array{0: array<string, mixed>, 1: bool} [trajeto, veioDoCache]
     */
    public function directions(string $profile, array $coordinates): array
    {
        if (!$this->supports($profile)) {
            throw new GeoException('Reserva de rotas so atende o perfil driving-car', 503);
        }

        $rounded = array_map(static fn(array $c): array => [round($c[0], 6), round($c[1], 6)], $coordinates);
        $key     = $profile . '|' . json_encode($rounded);

        return GeoCache::remember('osrm', $key, $this->cfg->routeTtlHours * 3600, function () use ($profile, $rounded): array {
            $path = implode(';', array_map(static fn(array $c): string => $c[0] . ',' . $c[1], $rounded));

            $response = $this->http->request('GET', $this->cfg->osrmUrl . '/route/v1/driving/' . $path, [
                'query'   => ['overview' => 'full', 'geometries' => 'geojson', 'steps' => 'false'],
                'headers' => ['User-Agent' => $this->cfg->nominatimUserAgent, 'Accept' => 'application/json'],
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
        $json = $response['json'];

        if ($response['status'] >= 500 || $response['status'] === 429) {
            throw new GeoException('Provedor de rotas indisponivel no momento', 503);
        }

        if ($response['status'] >= 400 || ($json['code'] ?? '') !== 'Ok') {
            throw new GeoException('Nao foi possivel calcular o trajeto', 422);
        }

        $route = $json['routes'][0] ?? null;

        if (!is_array($route) || !isset($route['geometry']['coordinates'])) {
            throw new GeoException('Resposta inesperada do provedor de rotas', 502);
        }

        $legs = [];
        foreach (($route['legs'] ?? []) as $leg) {
            $legs[] = [
                'distance_m' => (int) round((float) ($leg['distance'] ?? 0)),
                'duration_s' => (int) round((float) ($leg['duration'] ?? 0)),
            ];
        }

        $lngs = array_column($route['geometry']['coordinates'], 0);
        $lats = array_column($route['geometry']['coordinates'], 1);

        return [
            'profile'    => $profile,
            'provider'   => 'osrm',
            'distance_m' => (int) round((float) $route['distance']),
            'duration_s' => (int) round((float) $route['duration']),
            'legs'       => $legs,
            'geometry'   => $route['geometry'],
            'bbox'       => $lngs !== [] ? [min($lngs), min($lats), max($lngs), max($lats)] : null,
        ];
    }
}
