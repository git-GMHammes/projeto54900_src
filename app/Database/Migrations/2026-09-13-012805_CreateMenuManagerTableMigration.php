<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela menu_manager — configuracao/branding do menu do sistema.
 *
 * Raiz da arvore Menu: menu_manager 1:N menu_items (self-join via parent_id
 * para submenus). Consumida pelo modulo Menu/MenuManager (API V1).
 *
 * DDL:
 *   title           VARCHAR(255)  NOT NULL              titulo do sistema
 *   image           VARCHAR(500)  NULL                  caminho/URL da imagem carregada
 *   message_icon    VARCHAR(64)   NULL                  icone (bootstrap icon) de mensagens ao usuario
 *   system_version  VARCHAR(20)   NULL DEFAULT '1.0.0'  versao do sistema
 *   status          ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateMenuManagerTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'image' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
                'null'       => true,
            ],
            'message_icon' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
                'null'       => true,
            ],
            'system_version' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
                'default'    => '1.0.0',
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['draft', 'active', 'inactive'],
                'default'    => 'draft',
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
        $this->forge->addKey('status');
        $this->forge->createTable('menu_manager');
    }

    public function down()
    {
        $this->forge->dropTable('menu_manager');
    }
}
