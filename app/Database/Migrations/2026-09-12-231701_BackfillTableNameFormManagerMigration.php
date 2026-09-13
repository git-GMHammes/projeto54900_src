<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Backfill pontual de table_name para os 2 form_manager ja existentes nesta
 * maquina de desenvolvimento, criados antes da coluna existir (id 10 e 11) e
 * hoje com a tabela errada exibida na edicao (adivinhada do submit_endpoint).
 *
 * Nao ha outra fonte de onde recuperar o valor correto — foi confirmado
 * manualmente com quem criou os registros. Especifica deste ambiente local;
 * nao faz sentido aplicar tal qual em outro ambiente com IDs diferentes.
 *
 * up():   grava table_name correto nos 2 registros.
 * down(): volta a NULL (estado anterior a esta migration).
 */
class BackfillTableNameFormManagerMigration extends Migration
{
    public function up()
    {
        $this->db->table('form_manager')->where('id', 10)->update(['table_name' => 'user_manager']);
        $this->db->table('form_manager')->where('id', 11)->update(['table_name' => 'user_profiles']);
    }

    public function down()
    {
        $this->db->table('form_manager')->whereIn('id', [10, 11])->update(['table_name' => null]);
    }
}
