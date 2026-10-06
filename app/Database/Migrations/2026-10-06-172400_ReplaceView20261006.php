<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria as 48 views do banco a partir da definicao real de cada uma no banco
 * DEV, conferida em 2026-10-06 (202610061724_replace_view.sql — DROP VIEW IF
 * EXISTS + CREATE VIEW de cada uma).
 *
 * Sao as 39 views do REMAKE anterior mais as 9 novas do modulo Messages:
 * view_message_attachments, view_message_contacts,
 * view_message_group_chat_summary, view_message_group_memberships,
 * view_message_group_posts, view_message_group_reads, view_message_mentions,
 * view_message_users_groups e view_message_warnings. A view_messages_manager
 * tambem mudou desde o REMAKE anterior (ganhou a coluna attachments_count).
 *
 * Depende do ReplaceTable20261006: as views apontam pras tabelas do banco.
 * Timestamp da classe (17:24) um minuto apos o SeedTable20261006 (17:23),
 * preservando a ordem de execucao do REMAKE.
 */
class ReplaceView20261006 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610061724_replace_view.sql');
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_aux_cor`');
        $this->db->query('DROP VIEW IF EXISTS `view_bootstrap_icons`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_event_attachments`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_event_attendees`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_event_extended_properties`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_event_invites`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_event_reminders`');
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_message_edits`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_message_mentions`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_messages`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_attachment_reports`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_attachments`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_favorites`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_members`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_room_warnings`');
        $this->db->query('DROP VIEW IF EXISTS `view_chat_rooms_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_form_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_list_actions`');
        $this->db->query('DROP VIEW IF EXISTS `view_list_columns`');
        $this->db->query('DROP VIEW IF EXISTS `view_list_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_menu_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_attachments`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_contacts`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_chat_summary`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_members`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_memberships`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_messages`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_posts`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_group_reads`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_groups_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_mentions`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_users_groups`');
        $this->db->query('DROP VIEW IF EXISTS `view_message_warnings`');
        $this->db->query('DROP VIEW IF EXISTS `view_messages_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_messages_users`');
        $this->db->query('DROP VIEW IF EXISTS `view_nav_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_route_manager`');
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
