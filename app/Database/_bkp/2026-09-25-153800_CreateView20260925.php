<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Cria as 5 views do banco (view_calendar_manager, view_form_manager,
 * view_upload_manager, view_user_directory, view_user_manager) a partir do
 * dump SQL puro de 2026-09-25 (202609251538_create_view.sql — DROP VIEW IF
 * EXISTS + CREATE VIEW de cada uma; em relacao a 202609241714_create_view.sql,
 * as quatro anteriores seguem identicas e entra a view_user_directory —
 * diretorio minimo de usuarios: id, um_username, uc_name, uc_email, usado no
 * campo de escolha de convidado do calendario).
 *
 * Mesmo padrao de 2026-09-24-171400_CreateView20260924.php. Roda por ultimo —
 * views dependem das tabelas ja existirem (ReplaceTable20260925). Sufixo no
 * nome da classe pra nao colidir com CreateView.
 */
class CreateView20260925 extends Migration
{
    public function up()
    {
        $this->executeSqlFile(__DIR__ . '/202609251538_create_view.sql');
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');
        $this->db->query('DROP VIEW IF EXISTS `view_form_manager`');
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
