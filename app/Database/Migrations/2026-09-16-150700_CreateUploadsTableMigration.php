<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateUploadsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'module' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
            ],
            'reference_id' => [
                'type' => 'BIGINT',
            ],
            'collection' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
                'null'       => true,
            ],
            'file_key' => [
                'type'       => 'CHAR',
                'constraint' => 32,
            ],
            'original_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'stored_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'storage_path' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
            ],
            'file_url' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
            ],
            'mime_type' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
                'null'       => true,
            ],
            'extension' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
            ],
            'file_size' => [
                'type' => 'BIGINT',
                'null' => true,
            ],
            'checksum_sha256' => [
                'type'       => 'CHAR',
                'constraint' => 64,
                'null'       => true,
            ],
            'category' => [
                'type'       => 'ENUM',
                'constraint' => ['image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'other'],
                'default'    => 'other',
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
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
        $this->forge->addUniqueKey('file_key');
        $this->forge->addKey(['module', 'reference_id'], false, false, 'module_reference_id');
        $this->forge->addKey('collection');
        $this->forge->addKey('category');
        $this->forge->addKey('status');
        $this->forge->createTable('uploads');
    }

    public function down()
    {
        $this->forge->dropTable('uploads');
    }
}
