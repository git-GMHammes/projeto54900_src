<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Popula TODAS as tabelas com o estado de dados de 2026-10-02, 16:25 a
 * partir de um dump SQL puro (202610021625_seed_table.sql — export
 * completo, DELETE + INSERT, uma tupla por linha).
 *
 * Mesmo padrao de 2026-09-28-161800_SeedTable20260928.php: le o .sql
 * (mesmo diretorio) e executa statement por statement via
 * $this->db->query(), sem Forge/Model. Depende do ReplaceTable20261002 (as
 * tabelas precisam existir antes). Timestamp da classe (16:25) um minuto
 * apos o ReplaceTable20261002 (16:24), preservando a ordem de execucao do
 * REMAKE.
 *
 * down() nao tem reversao generica — fica vazio de proposito.
 */
class SeedTable20261002 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610021625_seed_table.sql');
    }

    public function down()
    {
        // Sem reversao generica para um dump de dados completo.
    }

    /**
     * Le um arquivo .sql e executa cada statement separadamente — o driver
     * MySQLi do CI4 nao roda multiplos ';' numa unica chamada de query().
     */
    protected function executeSqlFile(string $path): void
    {
        $sql = file_get_contents($path);
        if ($sql === false) {
            throw new \RuntimeException("Nao foi possivel ler {$path}");
        }

        $statements = preg_split('/;\s*[\r\n]+/', $sql);

        foreach ($statements as $statement) {
            $statement = trim($statement);
            if ($statement === '') {
                continue;
            }
            $this->db->query($statement);
        }
    }
}
