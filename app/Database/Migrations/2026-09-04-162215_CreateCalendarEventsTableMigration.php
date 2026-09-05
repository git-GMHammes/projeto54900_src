<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateCalendarEventsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'calendar_id' => [
                'type' => 'BIGINT',
            ],
            'google_event_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 512,
                'null'       => true,
            ],
            'ical_uid' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['confirmed', 'tentative', 'cancelled'],
                'default'    => 'confirmed',
            ],
            'summary' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'location' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'start_date' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'start_datetime' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'start_time_zone' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],
            'end_date' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'end_datetime' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'end_time_zone' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],
            'recurrence' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'recurring_event_id' => [
                'type' => 'BIGINT',
                'null' => true,
            ],
            'sequence' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'transparency' => [
                'type'       => 'ENUM',
                'constraint' => ['opaque', 'transparent'],
                'default'    => 'opaque',
            ],
            'visibility' => [
                'type'       => 'ENUM',
                'constraint' => ['default', 'public', 'private', 'confidential'],
                'default'    => 'default',
            ],
            'color_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
            ],
            'event_type' => [
                'type'       => 'ENUM',
                'constraint' => ['default', 'outOfOffice', 'focusTime', 'workingLocation', 'birthday'],
                'default'    => 'default',
            ],
            'guests_can_modify' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'guests_can_invite_others' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
            ],
            'guests_can_see_other_guests' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
            ],
            'anyone_can_add_self' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'html_link' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
                'null'       => true,
            ],
            'google_created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'google_updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
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
        $this->forge->addUniqueKey('google_event_id');
        $this->forge->addKey('calendar_id');
        $this->forge->addKey('recurring_event_id');
        $this->forge->addForeignKey('calendar_id', 'calendars', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('recurring_event_id', 'calendar_events', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('calendar_events');
    }

    public function down()
    {
        $this->forge->dropTable('calendar_events');
    }
}
