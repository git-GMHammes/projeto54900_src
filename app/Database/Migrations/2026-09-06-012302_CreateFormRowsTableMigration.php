<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela form_rows — linhas de um subgrupo.
 *
 * Cada linha agrupa de 1 a 12 campos (form_campos), seguindo o grid de 12
 * colunas do Bootstrap: a contagem de campos vai de 1 a 12 e a soma dos
 * respectivos `col` nao pode passar de 12. Essa regra e validada no
 * Services\V1\Form\FormRows\Processor (hook), nao no DDL.
 *
 * FK para form_groups (CASCADE).
 *
 * DDL:
 *   form_group_id BIGINT       NOT NULL  FK -> form_groups.id (CASCADE)
 *   sort_order    INT          NOT NULL DEFAULT 0  ordem da linha dentro do grupo
 *   gutter        VARCHAR(8)   NULL DEFAULT 'g-3'  classe de gap do Bootstrap (row g-3)
 *   note          VARCHAR(255) NULL
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateFormRowsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'form_group_id' => [
                'type' => 'BIGINT',
            ],
            'sort_order' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'gutter' => [
                'type'       => 'VARCHAR',
                'constraint' => 8,
                'null'       => true,
                'default'    => 'g-3',
            ],
            'note' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'created_at' => [
                'type'    => 'DATETIME',
                'null'    => true,
                'default' => new RawSql('CURRENT_TIMESTAMP'),
            ],
            'updated_at' => [
                'type'    => 'DATETIME',
                'null'    => true,
                'default' => new RawSql('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ],
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('form_group_id');
        $this->forge->addKey('sort_order');
        $this->forge->addForeignKey('form_group_id', 'form_groups', 'id', '', 'CASCADE');
        $this->forge->createTable('form_rows');
    }

    public function down()
    {
        $this->forge->dropTable('form_rows');
    }
}
