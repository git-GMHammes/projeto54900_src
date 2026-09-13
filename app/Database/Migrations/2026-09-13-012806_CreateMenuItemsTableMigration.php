<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela menu_items — itens/submenus de um menu_manager.
 *
 * Arvore em adjacency list: parent_id referencia a propria tabela (NULL = item
 * de primeiro nivel). FK para menu_manager e para si mesma, ambas CASCADE.
 *
 * DDL:
 *   menu_id      BIGINT       NOT NULL  FK -> menu_manager.id (CASCADE)
 *   parent_id    BIGINT       NULL      FK -> menu_items.id (CASCADE)   liga ao item pai (submenu)
 *   title        VARCHAR(255) NOT NULL             titulo do item
 *   react_route  VARCHAR(255) NULL                 rota do frontend
 *   permissions  JSON         NULL                 lista de permissoes
 *   sort_order   INT          NOT NULL DEFAULT 0   ordem entre irmaos
 *   status       ENUM('active','draft','inactive') NOT NULL DEFAULT 'draft'
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateMenuItemsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'menu_id' => [
                'type' => 'BIGINT',
            ],
            'parent_id' => [
                'type' => 'BIGINT',
                'null' => true,
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'react_route' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'permissions' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'sort_order' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['active', 'draft', 'inactive'],
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
        $this->forge->addKey(['menu_id', 'parent_id']);
        $this->forge->addKey('sort_order');
        $this->forge->addKey('status');
        $this->forge->addForeignKey('menu_id', 'menu_manager', 'id', '', 'CASCADE');
        $this->forge->addForeignKey('parent_id', 'menu_items', 'id', '', 'CASCADE');
        $this->forge->createTable('menu_items');
    }

    public function down()
    {
        $this->forge->dropTable('menu_items');
    }
}
