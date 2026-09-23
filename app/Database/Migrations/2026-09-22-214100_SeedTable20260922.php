<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Popula TODAS as tabelas com o estado de dados de 2026-09-22 a partir de um
 * dump SQL puro (202609222141_seed_table.sql — export completo, so INSERT).
 *
 * Mesmo padrao de 2026-09-20-181800_SeedTable.php: le o .sql (mesmo
 * diretorio) e executa statement por statement via $this->db->query(), sem
 * Forge/Model. Roda depois de ReplaceTable20260922 (tabelas precisam existir
 * antes). Sufixo no nome da classe pra nao colidir com SeedTable.
 *
 * down() nao tem reversao generica — fica vazio de proposito.
 */
class SeedTable20260922 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609222141_seed_table.sql');
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
