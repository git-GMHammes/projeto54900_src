<?php

namespace App\Libraries\Map;

/**
 * Protecao de cota dos provedores.
 *
 *  - spaceCalls(): garante intervalo minimo entre chamadas ao mesmo provedor
 *    (Nominatim publico: 1 req/s), com trava de arquivo para valer entre
 *    processos do php-fpm.
 *  - allowUser(): teto de consultas por usuario por minuto.
 */
class Throttle
{
    public static function spaceCalls(string $provider, int $minMs): void
    {
        $name   = preg_replace('/[^a-z0-9_]/', '', strtolower($provider));
        $handle = @fopen(WRITEPATH . 'cache/map_' . $name . '.lock', 'c+');

        if ($handle === false) {
            return;
        }

        flock($handle, LOCK_EX);

        $last = (float) stream_get_contents($handle);
        $now  = microtime(true);
        $wait = ($last + $minMs / 1000) - $now;

        if ($wait > 0) {
            usleep((int) ($wait * 1_000_000));
            $now = microtime(true);
        }

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, (string) $now);
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);
    }

    public static function allowUser(int $userId, int $limitPerMinute): bool
    {
        $key   = 'map_geo_u' . $userId . '_' . date('YmdHi');
        $count = (int) (cache($key) ?? 0) + 1;

        cache()->save($key, $count, 120);

        return $count <= $limitPerMinute;
    }
}
