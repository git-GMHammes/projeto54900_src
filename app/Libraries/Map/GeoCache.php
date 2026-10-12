<?php

namespace App\Libraries\Map;

use Config\Database;

/**
 * Cache de consultas aos provedores em map_geocode_cache.
 *
 * A politica do Nominatim publico exige cache. Resultado vazio tambem e
 * guardado, mas por no maximo 24 h, para nao repetir consulta sem resposta.
 */
class GeoCache
{
    public static function key(string $provider, string $text): string
    {
        return hash('sha256', $provider . '|' . mb_strtolower(trim($text)));
    }

    /**
     * @param callable(): array $fetch chamada real ao provedor, so se nao houver cache valido
     *
     * @return array{0: array, 1: bool} [dados, veioDoCache]
     */
    public static function remember(string $provider, string $text, int $ttlSeconds, callable $fetch): array
    {
        $db   = Database::connect(DB_GROUP_001);
        $hash = self::key($provider, $text);
        $row  = $db->table('map_geocode_cache')->where('query_hash', $hash)->get()->getRowArray();

        if ($row !== null && $row['deleted_at'] === null && $row['expires_at'] !== null && strtotime((string) $row['expires_at']) > time()) {
            $cached = json_decode((string) $row['result_json'], true);

            if (is_array($cached)) {
                return [$cached, true];
            }
        }

        $data  = $fetch();
        $ttl   = $data === [] ? min($ttlSeconds, 86400) : $ttlSeconds;
        $first = isset($data[0]) && is_array($data[0]) ? $data[0] : $data;

        $values = [
            'provider'    => $provider,
            'query_text'  => mb_substr($text, 0, 500),
            'lat'         => isset($first['lat']) && is_numeric($first['lat']) ? $first['lat'] : null,
            'lng'         => isset($first['lng']) && is_numeric($first['lng']) ? $first['lng'] : null,
            'result_json' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'expires_at'  => date('Y-m-d H:i:s', time() + $ttl),
            'deleted_at'  => null,
        ];

        if ($row !== null) {
            $db->table('map_geocode_cache')->where('id', $row['id'])->update($values);
        } else {
            $db->table('map_geocode_cache')->insert($values + ['query_hash' => $hash]);
        }

        return [$data, false];
    }
}
