<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateCalendarEventRemindersTableMigration extends Migration
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
            'method' => [
                'type'       => 'ENUM',
                'constraint' => ['email', 'popup'],
                'default'    => 'popup',
            ],
            'minutes' => [
                'type'       => 'INT',
                'constraint' => 11,
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
        $this->forge->createTable('calendar_event_reminders');
    }

    public function down()
    {
        $this->forge->dropTable('calendar_event_reminders');
    }
}
