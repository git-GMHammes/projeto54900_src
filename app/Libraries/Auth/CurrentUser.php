<?php

namespace App\Libraries\Auth;

/**
 * Porta-luvas do usuario autenticado dentro de UM request.
 *
 * JwtAuthFilter::before() preenche as claims do access token validado;
 * os controllers atras do filtro (hoje: auth/me, auth/logout) leem daqui.
 * Estatico por request — cada requisicao PHP-FPM e um processo isolado.
 */
class CurrentUser
{
    private static ?array $claims = null;

    public static function setClaims(array $claims): void
    {
        self::$claims = $claims;
    }

    public static function claims(): ?array
    {
        return self::$claims;
    }

    public static function id(): ?int
    {
        $sub = self::$claims['sub'] ?? null;

        return $sub !== null ? (int) $sub : null;
    }
}
