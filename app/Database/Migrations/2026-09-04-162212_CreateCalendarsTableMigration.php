<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateCalendarsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'google_calendar_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'summary' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'time_zone' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
            ],
            'location' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'background_color' => [
                'type'       => 'VARCHAR',
                'constraint' => 7,
                'null'       => true,
            ],
            'foreground_color' => [
                'type'       => 'VARCHAR',
                'constraint' => 7,
                'null'       => true,
            ],
            'access_role' => [
                'type'       => 'ENUM',
                'constraint' => ['freeBusyReader', 'reader', 'writer', 'owner'],
                'default'    => 'owner',
            ],
            'is_primary' => [
                'type'    => 'TINYINT',
                'constraint' => 1,
                'default' => 0,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['active', 'inactive'],
                'default'    => 'active',
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
        $this->forge->addUniqueKey('google_calendar_id');
        $this->forge->createTable('calendars');
    }

    public function down()
    {
        $this->forge->dropTable('calendars');
    }
}
