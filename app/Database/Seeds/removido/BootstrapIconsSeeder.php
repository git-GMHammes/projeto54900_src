<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use Config\Services;
use RuntimeException;
use Throwable;

/**
 * Seed da tabela bootstrap_icons — catalogo de icones do Bootstrap Icons.
 *
 * Formato dos dados: objeto plano { "nome-do-icone": codepoint_decimal }.
 *
 * Origem (nesta ordem):
 *   1. arquivo local `public/bootstrap-icons.json` (versionado) — sem rede;
 *   2. fallback: download de bootstrap-icons.json no jsDelivr (versao 1.11.3),
 *      so quando o arquivo local nao existe.
 *
 * Preenche as colunas `name` e `codepoint`. `is_favorite` fica no default (0);
 * created_at/updated_at sao automaticos (DEFAULT / ON UPDATE CURRENT_TIMESTAMP).
 *
 * Idempotente: INSERT ... ON DUPLICATE KEY UPDATE `codepoint` (a coluna `name` e
 * UNIQUE). Reexecutar atualiza os codepoints sem apagar favoritos ja marcados.
 *
 * Rodar:  php spark db:seed BootstrapIconsSeeder
 */
class BootstrapIconsSeeder extends Seeder
{
    private const SOURCE_URL =
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.json';

    private const LOCAL_FILE = FCPATH . 'bootstrap-icons.json';

    private const TABLE = 'bootstrap_icons';

    private const CHUNK = 500;

    public function run(): void
    {
        $icons = $this->baixarIcones();

        $total = 0;
        foreach (array_chunk($icons, self::CHUNK, true) as $chunk) {
            $total += $this->gravarChunk($chunk);
        }

        echo sprintf("BootstrapIconsSeeder: %d icones processados.\n", $total);
    }

    /**
     * Carrega e saneia a lista de icones (arquivo local; CDN so no fallback).
     *
     * @return array<string, int> nome -> codepoint
     */
    private function baixarIcones(): array
    {
        [$origem, $json] = $this->lerJson();

        /** @var mixed $data */
        $data = json_decode($json, true);

        if (! is_array($data) || $data === []) {
            throw new RuntimeException("JSON invalido ou vazio ({$origem}).");
        }

        $icons = [];
        foreach ($data as $name => $codepoint) {
            $name = trim((string) $name);
            if ($name === '' || ! is_numeric($codepoint)) {
                continue;
            }
            $icons[$name] = (int) $codepoint;
        }

        if ($icons === []) {
            throw new RuntimeException("Nenhum icone valido ({$origem}).");
        }

        return $icons;
    }

    /**
     * Devolve [origem, conteudo] da JSON: arquivo local se existir, senao CDN.
     *
     * @return array{0: string, 1: string}
     */
    private function lerJson(): array
    {
        if (is_file(self::LOCAL_FILE) && is_readable(self::LOCAL_FILE)) {
            $conteudo = file_get_contents(self::LOCAL_FILE);
            if ($conteudo === false || $conteudo === '') {
                throw new RuntimeException('Nao foi possivel ler ' . self::LOCAL_FILE);
            }

            return [self::LOCAL_FILE, $conteudo];
        }

        try {
            $response = Services::curlrequest(['timeout' => 20])->get(self::SOURCE_URL);
        } catch (Throwable $e) {
            throw new RuntimeException(
                'Arquivo local ausente e falha ao baixar ' . self::SOURCE_URL . ': ' . $e->getMessage()
            );
        }

        if ($response->getStatusCode() !== 200) {
            throw new RuntimeException(
                'HTTP ' . $response->getStatusCode() . ' ao baixar ' . self::SOURCE_URL
            );
        }

        return [self::SOURCE_URL, (string) $response->getBody()];
    }

    /**
     * Grava um bloco via upsert (name e UNIQUE).
     *
     * @param array<string, int> $chunk
     */
    private function gravarChunk(array $chunk): int
    {
        $placeholders = [];
        $binds        = [];

        foreach ($chunk as $name => $codepoint) {
            $placeholders[] = '(?, ?)';
            $binds[]        = $name;
            $binds[]        = $codepoint;
        }

        $sql = 'INSERT INTO `' . self::TABLE . '` (`name`, `codepoint`) VALUES '
            . implode(', ', $placeholders)
            . ' ON DUPLICATE KEY UPDATE `codepoint` = VALUES(`codepoint`)';

        $this->db->query($sql, $binds);

        return count($chunk);
    }
}
