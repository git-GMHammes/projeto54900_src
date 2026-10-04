<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria as 34 views do banco a partir da ESTRUTURA REAL das tabelas (colunas
 * + chaves estrangeiras) do banco DEV, conferida em 2026-10-04
 * (202610040127_replace_view.sql — DROP VIEW IF EXISTS + CREATE VIEW de cada
 * uma).
 *
 * Regra aplicada: cada view expoe TODAS as colunas das tabelas envolvidas —
 * `id`/`created_at`/`updated_at`/`deleted_at` da tabela principal sem prefixo,
 * as demais com prefixo `{alias}_` — exceto `password_hash`, `token` e
 * `permissions`. As chaves estrangeiras viram juncoes a esquerda; as colunas
 * ocultadas por `deleted_at IS NULL` saem nulas.
 *
 * 19 views ja existentes + 15 novas (uma por tabela base sem view, exceto
 * `migrations`):
 *
 *   view_aux_cor, view_bootstrap_icons, view_calendar_event_attachments,
 *   view_calendar_event_attendees, view_calendar_event_extended_properties,
 *   view_calendar_event_invites, view_calendar_event_reminders,
 *   view_calendar_manager, view_chat_message_edits, view_chat_message_mentions,
 *   view_chat_messages, view_chat_room_attachment_reports,
 *   view_chat_room_attachments, view_chat_room_favorites,
 *   view_chat_room_members, view_chat_room_warnings, view_chat_rooms_manager,
 *   view_form_manager, view_list_actions, view_list_columns, view_list_manager,
 *   view_menu_manager, view_nav_manager, view_route_manager,
 *   view_timeline_manager, view_timeline_post_attachments,
 *   view_timeline_post_comments, view_timeline_post_ratings,
 *   view_timeline_post_reactions, view_timeline_post_reports,
 *   view_timeline_posts, view_upload_manager, view_user_directory,
 *   view_user_manager.
 *
 * Depende do ReplaceTable20261004: as views apontam pras tabelas do banco.
 * Timestamp da classe (01:27) um minuto apos o SeedTable20261004 (01:26),
 * preservando a ordem de execucao do REMAKE.
 */
class ReplaceView20261004 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202610040127_replace_view.sql');
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
