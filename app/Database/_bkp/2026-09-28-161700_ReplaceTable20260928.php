<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria TODO o schema do banco a partir do dump SQL puro de 2026-09-28,
 * 16:17 (202609281617_replace_table.sql — DROP TABLE IF EXISTS + CREATE
 * TABLE IF NOT EXISTS de todas as tabelas reais, mais `migrations`).
 *
 * Primeiro REMAKE do dia: sufixo so com a data (20260928) nao colide com
 * nenhuma classe existente. Diferente do padrao de
 * 2026-09-27-230000_ReplaceTable202609272300.php (as 3 SQL daquele REMAKE
 * compartilhavam o mesmo timestamp), este REMAKE foi gerado com um timestamp
 * por arquivo, um minuto de diferenca entre cada um (1617/1618/1619) — a
 * classe PHP espelha o timestamp do respectivo .sql pra preservar a ordem de
 * execucao (replace_table -> seed_table -> replace_view).
 *
 * Este REMAKE e o primeiro a incluir o modulo ChatRooms (2026-09-28):
 * chat_rooms_manager e as 6 tabelas dependentes (chat_room_members,
 * chat_messages, chat_room_attachments, chat_room_attachment_reports,
 * chat_room_warnings, chat_room_favorites) — ver README_modulo_chatrooms.md.
 *
 * O dump nao traz `CREATE DATABASE` / `USE`; o filtro fica como protecao pra
 * migration sempre rodar no banco configurado em .env/Database.php, nao num
 * nome cravado no .sql.
 *
 * down() nao tem inverso generico pra um DROP+CREATE em bloco -- fica vazio
 * de proposito.
 */
class ReplaceTable20260928 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609281617_replace_table.sql');
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
