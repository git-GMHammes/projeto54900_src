<?php

namespace App\Libraries;

/**
 * Filtro de palavrao no BACKEND — mesma regra do frontend (utils/palavrasProibidas.ts):
 *
 *  - O dicionario e o JSON UNICO src/frontend/projeto54900/src/config/palavras-proibidas.json (campo `palavras`):
 *    editar so o JSON muda o chat de salas, o frontend de mensagens e o backend. E lido a cada requisicao.
 *  - Nao diferencia maiuscula de minuscula nem acento ('Cu' = 'cu').
 *  - So palavras INTEIRAS: 'cu' bloqueia 'vai tomar no cu', mas nao 'custo' nem 'cuidado'.
 *  - Frases tambem valem (espacos sao comparados como um espaco so).
 *
 * Arquivo ausente ou JSON invalido NAO bloqueia o envio (o chat nao pode parar por causa do dicionario): o erro
 * vai para o log. Quem decide se um usuario e isento (ex.: admin) e o chamador.
 */
class ForbiddenWords
{
    /** Caminho do dicionario, a partir da raiz do backend (ROOTPATH = pasta do spark). */
    public const FILE = 'frontend/projeto54900/src/config/palavras-proibidas.json';

    /** @var list<array{original: string, regex: string}>|null cache por requisicao */
    private static ?array $patterns = null;

    /** Minusculas, sem acento e com espacos simples. */
    public static function normalize(string $text): string
    {
        if (class_exists(\Normalizer::class)) {
            $text = \Normalizer::normalize($text, \Normalizer::FORM_D) ?: $text;
        } else {
            $text = (string) iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        }

        $text = (string) preg_replace('/\p{M}+/u', '', $text);
        $text = mb_strtolower($text, 'UTF-8');

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    /**
     * Palavras proibidas presentes no texto, como cadastradas no JSON. Lista vazia = texto liberado.
     *
     * @return list<string>
     */
    public static function find(string $text): array
    {
        $target = self::normalize($text);
        if ($target === '') {
            return [];
        }

        $found = [];
        foreach (self::patterns() as $pattern) {
            if (preg_match($pattern['regex'], $target) === 1) {
                $found[] = $pattern['original'];
            }
        }

        return $found;
    }

    /** Primeira palavra proibida encontrada, ou null se o texto esta liberado. */
    public static function first(string $text): ?string
    {
        return self::find($text)[0] ?? null;
    }

    /** @return list<array{original: string, regex: string}> */
    private static function patterns(): array
    {
        if (self::$patterns !== null) {
            return self::$patterns;
        }

        self::$patterns = [];
        $path           = rtrim(ROOTPATH, '/\\') . '/' . self::FILE;

        if (!is_file($path)) {
            log_message('error', '[ForbiddenWords] dicionario nao encontrado: ' . $path . ' (filtro desativado)');

            return self::$patterns;
        }

        $json = json_decode((string) file_get_contents($path), true);
        if (!is_array($json) || !is_array($json['palavras'] ?? null)) {
            log_message('error', '[ForbiddenWords] JSON invalido em ' . $path . ' (filtro desativado)');

            return self::$patterns;
        }

        foreach ($json['palavras'] as $original) {
            if (!is_string($original)) {
                continue;
            }

            $normalized = self::normalize($original);
            if ($normalized === '') {
                continue;
            }

            self::$patterns[] = [
                'original' => $original,
                'regex'    => '/(?<![\p{L}\p{N}])' . preg_quote($normalized, '/') . '(?![\p{L}\p{N}])/u',
            ];
        }

        return self::$patterns;
    }
}
