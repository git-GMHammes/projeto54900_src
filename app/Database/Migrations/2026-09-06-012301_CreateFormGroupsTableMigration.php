<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela form_groups — subgrupos de contexto de um formulario.
 *
 * Equivale ao sectionTitle do FormGrid ("Dados Pessoais", "Contato", ...).
 * Agrupa linhas (form_rows) com o mesmo contexto. FK para form_manager (CASCADE).
 *
 * DDL:
 *   form_manager_id BIGINT       NOT NULL  FK -> form_manager.id (CASCADE)
 *   title           VARCHAR(255) NOT NULL            titulo da secao
 *   slug            VARCHAR(255) NULL                kebab-case, unico por formulario (regra no Processor)
 *   description     TEXT         NULL
 *   icon            VARCHAR(64)  NULL
 *   sort_order      INT          NOT NULL DEFAULT 0  ordem da secao no formulario
 *   collapsed       TINYINT(1)   NOT NULL DEFAULT 0  dica de UI (secao recolhida)
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateFormGroupsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'form_manager_id' => [
                'type' => 'BIGINT',
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'slug' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'icon' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
                'null'       => true,
            ],
            'sort_order' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'collapsed' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
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
        $this->forge->addKey(['form_manager_id', 'slug']);
        $this->forge->addKey('sort_order');
        $this->forge->addForeignKey('form_manager_id', 'form_manager', 'id', '', 'CASCADE');
        $this->forge->createTable('form_groups');
    }

    public function down()
    {
        $this->forge->dropTable('form_groups');
    }
}
