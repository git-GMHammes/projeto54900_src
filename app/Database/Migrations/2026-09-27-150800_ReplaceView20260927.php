<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Recria as 12 views do banco (view_calendar_manager, view_form_manager,
 * view_timeline_manager, view_timeline_post_attachments,
 * view_timeline_post_comments, view_timeline_post_ratings,
 * view_timeline_post_reactions, view_timeline_post_reports,
 * view_timeline_posts, view_upload_manager, view_user_directory,
 * view_user_manager) a partir do dump SQL puro de 2026-09-27
 * (202609271508_replace_view.sql — DROP VIEW IF EXISTS + CREATE VIEW de cada
 * uma).
 *
 * Mesmo padrao de 2026-09-25-153800_CreateView20260925.php, com a mudanca de
 * sufixo de 2026-09-27 registrada no README_migrate.md: a terceira migration
 * passa de create_view para replace_view (mesmo padrao de replace_table —
 * destroi e recria). Sufixo no nome da classe pra nao colidir no namespace.
 *
 * Depende do ReplaceTable20260927: as views apontam pras tabelas do banco.
 */
class ReplaceView20260927 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609271508_replace_view.sql');
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
