<?php

namespace App\Libraries\Map;

use Config\Database;

/**
 * CEP: texto do endereco pelo ViaCEP (reserva: BrasilAPI) e coordenada pelo
 * Nominatim. O resultado e gravado em map_postal_codes, que passa a ser o
 * cache local: CEP ja resolvido nao chama mais provedor nenhum.
 *
 * source em map_postal_codes: 'nominatim' quando a coordenada veio do
 * Nominatim, 'viacep' quando so o texto foi obtido (a BrasilAPI agrega os
 * mesmos dados e tambem entra como 'viacep', pois o ENUM nao tem 'brasilapi').
 */
class CepClient
{
    private HttpClient $http;
    private NominatimClient $nominatim;
    private \Config\MapProviders $cfg;

    public function __construct(?HttpClient $http = null, ?NominatimClient $nominatim = null)
    {
        $this->http      = $http ?? new HttpClient();
        $this->nominatim = $nominatim ?? new NominatimClient($this->http);
        $this->cfg       = config('MapProviders');
    }

    /**
     * @return array{0: array<string, mixed>, 1: bool} [linha de map_postal_codes, veioDoBanco]
     */
    public function resolve(string $cep, bool $refresh = false): array
    {
        $db    = Database::connect(DB_GROUP_001);
        $table = $db->table('map_postal_codes');
        $row   = $table->where('cep', $cep)->get()->getRowArray();

        if ($row !== null && $row['deleted_at'] === null && !$refresh && $row['lat'] !== null) {
            return [$row, true];
        }

        $text = ($row !== null && !$refresh && !empty($row['city']))
            ? [
                'street' => $row['street'], 'neighborhood' => $row['neighborhood'], 'city' => $row['city'],
                'state' => $row['state'], 'ibge_code' => $row['ibge_code'],
            ]
            : $this->lookupText($cep);

        if ($text === null) {
            throw new GeoException('CEP nao encontrado', 404);
        }

        $lat    = null;
        $lng    = null;
        $source = 'viacep';
        $parts  = array_filter([$text['street'] ?? null, $text['neighborhood'] ?? null, $text['city'] ?? null, $text['state'] ?? null]);
        $query  = implode(', ', $parts) . ', Brasil';

        [$items] = $this->nominatim->search($query, 1);

        if ($items === [] && !empty($text['city'])) {
            [$items] = $this->nominatim->search($text['city'] . ', ' . ($text['state'] ?? '') . ', Brasil', 1);
        }

        if ($items !== []) {
            $lat    = $items[0]['lat'];
            $lng    = $items[0]['lng'];
            $source = 'nominatim';
        }

        $values = [
            'street'       => $text['street'] ?: null,
            'neighborhood' => $text['neighborhood'] ?: null,
            'city'         => $text['city'] ?: null,
            'state'        => $text['state'] ?: null,
            'ibge_code'    => $text['ibge_code'] ?: null,
            'lat'          => $lat,
            'lng'          => $lng,
            'source'       => $source,
            'deleted_at'   => null,
        ];

        if ($row !== null) {
            $db->table('map_postal_codes')->where('id', $row['id'])->update($values);
            $id = (int) $row['id'];
        } else {
            $db->table('map_postal_codes')->insert($values + ['cep' => $cep]);
            $id = (int) $db->insertID();
        }

        return [$db->table('map_postal_codes')->where('id', $id)->get()->getRowArray(), false];
    }

    /**
     * @return array<string, ?string>|null null = CEP inexistente
     */
    private function lookupText(string $cep): ?array
    {
        try {
            $r = $this->http->request('GET', $this->cfg->viaCepUrl . '/' . $cep . '/json/', [
                'headers' => ['Accept' => 'application/json'],
            ]);

            if ($r['status'] === 200 && is_array($r['json'])) {
                if (!empty($r['json']['erro'])) {
                    return null;
                }

                return [
                    'street'       => (string) ($r['json']['logradouro'] ?? ''),
                    'neighborhood' => (string) ($r['json']['bairro'] ?? ''),
                    'city'         => (string) ($r['json']['localidade'] ?? ''),
                    'state'        => (string) ($r['json']['uf'] ?? ''),
                    'ibge_code'    => (string) ($r['json']['ibge'] ?? ''),
                ];
            }

            if ($r['status'] === 400) {
                return null;
            }
        } catch (GeoException) {
            // ViaCEP fora do ar: tenta a BrasilAPI.
        }

        $r = $this->http->request('GET', $this->cfg->brasilApiUrl . '/cep/v1/' . $cep, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        if ($r['status'] === 404) {
            return null;
        }

        if ($r['status'] !== 200 || !is_array($r['json'])) {
            throw new GeoException('Servico de CEP indisponivel no momento', 502);
        }

        return [
            'street'       => (string) ($r['json']['street'] ?? ''),
            'neighborhood' => (string) ($r['json']['neighborhood'] ?? ''),
            'city'         => (string) ($r['json']['city'] ?? ''),
            'state'        => (string) ($r['json']['state'] ?? ''),
            'ibge_code'    => null,
        ];
    }
}
