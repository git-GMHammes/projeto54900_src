<?php

namespace App\Libraries\Map;

/**
 * Nominatim (OpenStreetMap): busca de endereco e geocodificacao reversa.
 *
 * Toda saida e normalizada para as colunas de map_addresses
 * (lat, lng, street, number, neighborhood, city, state, cep, osm_type, osm_id,
 * display_name, geocode_precision), para o frontend gravar direto.
 */
class NominatimClient
{
    private const ROAD_TYPES = [
        'road', 'residential', 'primary', 'secondary', 'tertiary', 'trunk', 'unclassified',
        'pedestrian', 'footway', 'service', 'living_street', 'motorway', 'street',
    ];

    private const AREA_TYPES = [
        'city', 'town', 'village', 'municipality', 'suburb', 'neighbourhood', 'quarter',
        'city_district', 'county', 'state', 'administrative',
    ];

    private HttpClient $http;
    private \Config\MapProviders $cfg;

    public function __construct(?HttpClient $http = null)
    {
        $this->http = $http ?? new HttpClient();
        $this->cfg  = config('MapProviders');
    }

    /**
     * @return array{0: list<array<string, mixed>>, 1: bool} [itens, veioDoCache]
     */
    public function search(string $q, int $limit = 5, ?string $country = null): array
    {
        $country = $country ?? $this->cfg->defaultCountry;
        $key     = 'search|' . $limit . '|' . $country . '|' . $q;

        return GeoCache::remember('nominatim', $key, $this->ttl(), function () use ($q, $limit, $country): array {
            $query = ['format' => 'jsonv2', 'addressdetails' => 1, 'limit' => $limit, 'q' => $q];

            if ($country !== '' && $country !== 'xx') {
                $query['countrycodes'] = $country;
            }

            $json = $this->call('/search', $query);

            return array_values(array_map(fn(array $item): array => $this->normalize($item), $json));
        });
    }

    /**
     * @return array{0: list<array<string, mixed>>, 1: bool}
     */
    public function reverse(float $lat, float $lng): array
    {
        $key = 'reverse|' . round($lat, 6) . '|' . round($lng, 6);

        return GeoCache::remember('nominatim', $key, $this->ttl(), function () use ($lat, $lng): array {
            $json = $this->call('/reverse', [
                'format' => 'jsonv2', 'addressdetails' => 1, 'lat' => $lat, 'lon' => $lng, 'zoom' => 18,
            ]);

            if ($json === [] || isset($json['error'])) {
                return [];
            }

            return [$this->normalize($json)];
        });
    }

    private function ttl(): int
    {
        return $this->cfg->geocodeTtlDays * 86400;
    }

    /**
     * @param array<string, mixed> $query
     *
     * @return array<mixed>
     */
    private function call(string $path, array $query): array
    {
        Throttle::spaceCalls('nominatim', $this->cfg->nominatimMinIntervalMs);

        $agent = $this->cfg->nominatimUserAgent
            . ($this->cfg->nominatimContact !== '' ? ' (' . $this->cfg->nominatimContact . ')' : '');

        $response = $this->http->request('GET', $this->cfg->nominatimUrl . $path, [
            'query'   => $query,
            'headers' => ['User-Agent' => $agent, 'Accept-Language' => 'pt-BR,pt;q=0.9', 'Accept' => 'application/json'],
        ]);

        if ($response['status'] === 429) {
            throw new GeoException('Limite de consultas do Nominatim atingido; tente em instantes', 429);
        }

        if ($response['status'] >= 400 || $response['json'] === null) {
            throw new GeoException('Nominatim indisponivel no momento', 502);
        }

        return $response['json'];
    }

    /**
     * @param array<string, mixed> $item
     *
     * @return array<string, mixed>
     */
    private function normalize(array $item): array
    {
        $a = is_array($item['address'] ?? null) ? $item['address'] : [];

        $uf = null;
        if (isset($a['ISO3166-2-lvl4']) && preg_match('/^[A-Z]{2}-([A-Z]{2})$/', (string) $a['ISO3166-2-lvl4'], $m)) {
            $uf = $m[1];
        }

        $cep = preg_replace('/\D/', '', (string) ($a['postcode'] ?? ''));

        return [
            'lat'              => (float) ($item['lat'] ?? 0),
            'lng'              => (float) ($item['lon'] ?? 0),
            'display_name'     => (string) ($item['display_name'] ?? ''),
            'street'           => $a['road'] ?? $a['pedestrian'] ?? $a['footway'] ?? null,
            'number'           => $a['house_number'] ?? null,
            'neighborhood'     => $a['suburb'] ?? $a['neighbourhood'] ?? $a['city_district'] ?? $a['quarter'] ?? null,
            'city'             => $a['city'] ?? $a['town'] ?? $a['village'] ?? $a['municipality'] ?? $a['county'] ?? null,
            'state'            => $uf,
            'cep'              => strlen((string) $cep) === 8 ? $cep : null,
            'country'          => strtoupper((string) ($a['country_code'] ?? 'br')),
            'osm_type'         => $item['osm_type'] ?? null,
            'osm_id'           => isset($item['osm_id']) ? (int) $item['osm_id'] : null,
            'geocode_source'   => 'nominatim',
            'geocode_precision' => $this->precision($item, $a),
        ];
    }

    /**
     * @param array<string, mixed> $item
     * @param array<string, mixed> $a
     */
    private function precision(array $item, array $a): string
    {
        $type = (string) ($item['addresstype'] ?? $item['type'] ?? '');

        if (isset($a['house_number']) || in_array($type, ['house', 'building', 'place'], true)) {
            return 'rooftop';
        }

        if (in_array($type, self::ROAD_TYPES, true)) {
            return 'street';
        }

        if ($type === 'postcode') {
            return 'postal_code';
        }

        if (in_array($type, self::AREA_TYPES, true)) {
            return 'city';
        }

        return 'approximate';
    }
}
