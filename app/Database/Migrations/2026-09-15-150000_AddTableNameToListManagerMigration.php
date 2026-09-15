<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Adiciona a coluna table_name a list_manager.
 *
 * Motivo: list_manager nunca guardava a tabela/view real de origem — o
 * construtor de listas tentava recupera-la no modo edicao "adivinhando" a
 * partir do slug/api_get_endpoint (tabelaDoEndpoint), o que falha sempre que
 * o nome nao corresponde (ex.: view_user_manager, sem relacao com o slug da
 * listagem). table_name passa a ser a fonte da verdade, validada contra o
 * schema real (SchemaInspector::isKnownTable) no
 * Services\V1\List\ListManager\Processor — mesmo padrao ja usado em
 * form_manager.table_name (AddTableNameToFormManagerMigration).
 *
 * up():   addColumn(table_name).
 * down(): dropColumn(table_name).
 */
class AddTableNameToListManagerMigration extends Migration
{
    public function up()
    {
        $this->forge->addColumn('list_manager', [
            'table_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
                'after'      => 'slug',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('list_manager', 'table_name');
    }
}
