<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria TODO o schema do banco a partir do dump SQL puro de 2026-10-04,
 * 01:25 (202610040125_replace_table.sql — DROP TABLE IF EXISTS + CREATE
 * TABLE IF NOT EXISTS das 40 tabelas base do banco DEV).
 *
 * REMAKE com um timestamp por arquivo, um minuto de diferenca entre cada um
 * (0125/0126/0127) — a classe PHP espelha o timestamp do respectivo .sql pra
 * preservar a ordem de execucao (replace_table -> seed_table -> replace_view).
 * Sufixo com a data (20261004) nao colide com nenhuma classe existente.
 *
 * O dump nao traz `CREATE DATABASE` / `USE`; o filtro fica como protecao pra
 * migration sempre rodar no banco configurado em Database.php, nao num nome
 * cravado no .sql.
 *
 * down() nao tem inverso generico pra um DROP+CREATE em bloco -- fica vazio
 * de proposito.
 */
class ReplaceTable20261004 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610040125_replace_table.sql');
    }

    public function down()
    {
        // Sem reversao generica para um dump de schema completo.
    }

    /**
     * Le um arquivo .sql e executa cada statement separadamente — o driver
     * MySQLi do CI4 nao roda multiplos ';' numa unica chamada de query().
     * Pula CREATE DATABASE / USE (banco vem da configuracao da conexao).
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
            if ($statement === '' || preg_match('/^(CREATE\s+DATABASE|USE\s)/i', $statement)) {
                continue;
            }
            $this->db->query($statement);
        }
    }
}
