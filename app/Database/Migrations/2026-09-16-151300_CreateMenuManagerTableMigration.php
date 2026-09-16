<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateMenuManagerTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'nav_manager_id' => [
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
            'roles' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'sort_order' => [
                'type'    => 'INT',
                'default' => 0,
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
        $this->forge->addKey('sort_order');
        $this->forge->addKey('status');
        $this->forge->addKey(['nav_manager_id', 'parent_id'], false, false, 'nav_manager_id_parent_id');
        $this->forge->addForeignKey('parent_id', 'menu_manager', 'id', '', 'CASCADE', 'menu_items_parent_id_foreign');
        $this->forge->addForeignKey('nav_manager_id', 'nav_manager', 'id', '', 'CASCADE', 'menu_manager_nav_manager_id_foreign');
        $this->forge->createTable('menu_manager');
    }

    public function down()
    {
        $this->forge->dropTable('menu_manager');
    }
}
