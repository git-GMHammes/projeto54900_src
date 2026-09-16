<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

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
                'type'    => 'INT',
                'default' => 0,
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
