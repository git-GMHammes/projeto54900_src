<?php

namespace App\Services\V1\Map\Concerns;

/**
 * Slug dos recursos do Map no cadastro: SEMPRE termina em "_AAAAMMDDHHMMSS" (unico).
 * Vazio, e gerado do titulo/nome (ASCII, minusculas); informado, o texto digitado e
 * mantido e recebe o sufixo (se ja terminar em _AAAAMMDDHHMMSS, nao duplica). Se o
 * slug final ja existir (mesmo texto no mesmo segundo), acrescenta "-NNN" ate ficar
 * livre. So no create: o update nunca troca o slug automaticamente.
 */
trait GeneratesSlug
{
    /**
     * @param \Closure(string): bool $exists informa se o slug ja esta em uso
     */
    protected function generateSlug(string $source, \Closure $exists, string $fallback, bool $literal = false): string
    {
        if ($literal && preg_match('/_\d{14}(-\d{3})?$/', $source) === 1) {
            $slug = $source;
        } else {
            $base = $literal ? trim($source) : $this->slugifyTitle($source);
            $base = $base !== '' ? $base : $fallback;
            $slug = substr($base, 0, 120) . '_' . date('YmdHis');
        }

        $root = $slug;

        while ($exists($slug)) {
            $slug = $root . '-' . random_int(100, 999);
        }

        return $slug;
    }

    private function slugifyTitle(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT', $value);
            if ($converted !== false) {
                $value = $converted;
            }
        }

        $value = strtolower($value);
        $value = (string) preg_replace('/[^a-z0-9]+/', '-', $value);

        return trim($value, '-');
    }
}
