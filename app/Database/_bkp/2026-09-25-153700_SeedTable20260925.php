<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Popula TODAS as tabelas com o estado de dados de 2026-09-25 a partir de um
 * dump SQL puro (202609251537_seed_table.sql — export completo, DELETE + INSERT).
 *
 * Mesmo padrao de 2026-09-24-171300_SeedTable20260924.php: le o .sql (mesmo
 * diretorio) e executa statement por statement via $this->db->query(), sem
 * Forge/Model. Roda depois de ReplaceTable20260925 (tabelas precisam existir
 * antes). Sufixo no nome da classe pra nao colidir com SeedTable.
 *
 * down() nao tem reversao generica — fica vazio de proposito.
 */
class SeedTable20260925 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609251537_seed_table.sql');
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
