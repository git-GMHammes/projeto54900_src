<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria TODO o schema do banco a partir do dump SQL puro de 2026-10-18,
 * 21:52 (202610182152_replace_table.sql — DROP TABLE IF EXISTS + CREATE
 * TABLE IF NOT EXISTS das tabelas base do banco DEV, incluindo as do modulo
 * Location e os triggers de location_manager).
 *
 * REMAKE com um timestamp por arquivo, um minuto de diferenca entre cada um
 * (2152/2153/2154) — a classe PHP espelha o timestamp do respectivo .sql pra
 * preservar a ordem de execucao (replace_table -> seed_table -> replace_view).
 * Sufixo com a data (20261018) nao colide com nenhuma classe existente.
 *
 * down() nao tem inverso generico pra um DROP+CREATE em bloco -- fica vazio
 * de proposito.
 */
class ReplaceTable20261018 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610182152_replace_table.sql');
    }

    public function down()
    {
        // Sem reversao generica para um dump de schema completo.
    }

    /**
     * Le um arquivo .sql e executa cada statement separadamente — o driver
     * MySQLi do CI4 nao roda multiplos ';' numa unica chamada de query().
     * Entende `DELIMITER` (usado nos CREATE TRIGGER): a linha DELIMITER nao
     * vai ao banco, so troca o terminador do parser. Pula CREATE DATABASE /
     * USE (banco vem da configuracao da conexao).
     */
    protected function executeSqlFile(string $path): void
    {
        $lines = file($path, FILE_IGNORE_NEW_LINES);
        if ($lines === false) {
            throw new \RuntimeException("Nao foi possivel ler {$path}");
        }

        $delimiter = ';';
        $buffer    = '';

        foreach ($lines as $line) {
            if ($buffer === '' && preg_match('/^\s*DELIMITER\s+(\S+)\s*$/i', $line, $m)) {
                $delimiter = $m[1];
                continue;
            }

            $buffer .= $line . "
";
            $trimmed = rtrim($buffer);

            if (substr($trimmed, -strlen($delimiter)) === $delimiter) {
                $this->runStatement(substr($trimmed, 0, -strlen($delimiter)));
                $buffer = '';
            }
        }

        $this->runStatement($buffer);
    }

    protected function runStatement(string $statement): void
    {
        $statement = trim($statement);
        if ($statement === '' || preg_match('/^(CREATE\s+DATABASE|USE\s)/i', $statement)) {
            return;
        }
        $this->db->query($statement);
    }
}
