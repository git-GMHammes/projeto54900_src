<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria as 19 views do banco a partir do dump SQL puro de 2026-10-02, 16:26
 * (202610021626_replace_view.sql — DROP VIEW IF EXISTS + CREATE VIEW de cada
 * uma).
 *
 * Lista conferida via `SHOW FULL TABLES WHERE Table_type = 'VIEW'` no banco
 * DEV nesta execucao:
 *
 *   view_calendar_manager, view_chat_messages,
 *   view_chat_room_attachment_reports, view_chat_room_attachments,
 *   view_chat_room_favorites, view_chat_room_members, view_chat_room_warnings,
 *   view_chat_rooms_manager, view_form_manager, view_timeline_manager,
 *   view_timeline_post_attachments, view_timeline_post_comments,
 *   view_timeline_post_ratings, view_timeline_post_reactions,
 *   view_timeline_post_reports, view_timeline_posts, view_upload_manager,
 *   view_user_directory, view_user_manager.
 *
 * Depende do ReplaceTable20261002: as views apontam pras tabelas do banco.
 * Timestamp da classe (16:26) um minuto apos o SeedTable20261002 (16:25),
 * preservando a ordem de execucao do REMAKE.
 */
class ReplaceView20261002 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610021626_replace_view.sql');
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_messages`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_attachment_reports`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_attachments`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_favorites`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_members`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_warnings`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_rooms_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_form_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_post_attachments`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_post_comments`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_post_ratings`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_post_reactions`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_post_reports`');
        $this->db->query('DROP VIEW IF EXISTS `view_timeline_posts`');
        $this->db->query('DROP VIEW IF EXISTS `view_upload_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_user_directory`');
        $this->db->query('DROP VIEW IF EXISTS `view_user_manager`');
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
