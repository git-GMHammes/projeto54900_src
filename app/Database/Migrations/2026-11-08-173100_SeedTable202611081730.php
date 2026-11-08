<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Popula TODAS as tabelas com o estado de dados de 2026-11-08, 17:31 a
 * partir de um dump SQL puro (202611081731_seed_table.sql — export
 * completo, DELETE + INSERT, uma tupla por linha).
 *
 * Mesmo padrao de 2026-10-18-215300_SeedTable20261018.php: le o .sql
 * (mesmo diretorio) e executa statement por statement via
 * $this->db->query(), sem Forge/Model. Depende do ReplaceTable202611081730 (as
 * tabelas precisam existir antes). Timestamp da classe (17:31) um minuto
 * apos o ReplaceTable202611081730 (17:30), preservando a ordem de execucao do
 * REMAKE.
 *
 * DESTRUTIVO: o DELETE FROM de cada tabela apaga qualquer dado criado
 * depois do snapshot. Tirar backup do banco antes de aplicar.
 *
 * down() nao tem reversao generica — fica vazio de proposito.
 */
class SeedTable202611081730 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202611081731_seed_table.sql');
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
        // Leitura em fluxo: o seed passa de 70 MB e carregar tudo de uma vez
        // estoura o memory_limit do PHP.
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new \RuntimeException("Nao foi possivel ler {$path}");
        }

        $buffer = '';

        while (($line = fgets($handle)) !== false) {
            $buffer .= $line;

            if (substr(rtrim($line), -1) === ';') {
                $this->runStatement(substr(rtrim($buffer), 0, -1));
                $buffer = '';
            }
        }

        fclose($handle);
        $this->runStatement($buffer);
    }

    protected function runStatement(string $statement): void
    {
        $statement = trim($statement);
        if ($statement !== '') {
            $this->db->query($statement);
        }
    }
}
