<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria as 12 views do banco (view_calendar_manager, view_form_manager,
 * view_timeline_manager, view_timeline_post_attachments,
 * view_timeline_post_comments, view_timeline_post_ratings,
 * view_timeline_post_reactions, view_timeline_post_reports,
 * view_timeline_posts, view_upload_manager, view_user_directory,
 * view_user_manager) a partir do dump SQL puro de 2026-09-27, 23:00
 * (202609272300_replace_view.sql — DROP VIEW IF EXISTS + CREATE VIEW de
 * cada uma).
 *
 * Definicoes conferidas via SHOW CREATE VIEW no banco DEV nesta execucao:
 * identicas as de 2026-09-27-150800_ReplaceView20260927.php (nenhuma view
 * mudou desde o REMAKE de hoje as 15:08), por isso o dump reaproveita o
 * mesmo texto ja formatado. Sufixo com o timestamp completo pelo mesmo
 * motivo do ReplaceTable202609272300 (evitar colisao com o REMAKE de hoje
 * mais cedo).
 *
 * Depende do ReplaceTable202609272300: as views apontam pras tabelas do
 * banco.
 */
class ReplaceView202609272300 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609272300_replace_view.sql');
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');
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
