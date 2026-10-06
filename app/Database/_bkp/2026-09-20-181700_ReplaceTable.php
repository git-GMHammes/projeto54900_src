<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria TODO o schema do banco a partir de um dump SQL puro
 * (202609201817_replace_table.sql, export completo — DROP TABLE IF EXISTS +
 * CREATE TABLE IF NOT EXISTS de todas as tabelas reais, mais `migrations`).
 *
 * Nao usa Forge (addColumn/createTable) — a migration so le o .sql (que fica
 * ao lado, no mesmo diretorio) e executa cada statement via $this->db->query().
 * Substitui as antigas migrations (Create/Alter/Rename por tabela),
 * consolidadas aqui por decisao explicita do usuario em
 * 2026-09-20 (SQL puro em vez de classes com Forge).
 *
 * down() nao tem inverso generico pra um DROP+CREATE em bloco -- fica vazio
 * de proposito.
 */
class ReplaceTable extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609201817_replace_table.sql');
    }

    public function down()
    {
        // Sem reversao generica para um dump de schema completo.
    }

    /**
     * Le um arquivo .sql e executa cada statement separadamente — o driver
     * MySQLi do CI4 nao roda multiplos ';' numa unica chamada de query().
     * Statements sao separados por ';' no fim de linha (formato padrao de
     * export do mysqldump/phpMyAdmin usado neste arquivo).
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
