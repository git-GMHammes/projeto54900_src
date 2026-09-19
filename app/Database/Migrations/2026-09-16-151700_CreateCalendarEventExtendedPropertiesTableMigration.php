<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateCalendarEventExtendedPropertiesTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'calendar_event_id' => [
                'type' => 'BIGINT',
            ],
            'scope' => [
                'type'       => 'ENUM',
                'constraint' => ['private', 'shared'],
                'default'    => 'private',
            ],
            'property_key' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'property_value' => [
                'type'       => 'VARCHAR',
                'constraint' => 1024,
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
        $this->forge->addKey('calendar_event_id');
        $this->forge->addForeignKey('calendar_event_id', 'calendar_events', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('calendar_event_extended_properties');
    }

    public function down()
    {
        $this->forge->dropTable('calendar_event_extended_properties');
    }
}
