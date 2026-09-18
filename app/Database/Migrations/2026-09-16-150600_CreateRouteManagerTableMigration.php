<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateRouteManagerTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'layer' => [
                'type'       => 'ENUM',
                'constraint' => ['backend', 'frontend'],
            ],
            'object' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'action' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'method' => [
                'type'       => 'ENUM',
                'constraint' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            ],
            'endpoint' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'controller_method' => [
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
        $this->forge->addKey('layer');
        $this->forge->addKey('object');
        $this->forge->addUniqueKey(['method', 'endpoint'], 'uk_route_manager_method_endpoint');
        $this->forge->createTable('route_manager');
    }

    public function down()
    {
        $this->forge->dropTable('route_manager');
    }
}
