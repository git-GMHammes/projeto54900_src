<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateFormFieldsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'form_row_id' => [
                'type' => 'BIGINT',
            ],
            'sort_order' => [
                'type'    => 'INT',
                'default' => 0,
            ],
            'field_type' => [
                'type'       => 'ENUM',
                'constraint' => ['text', 'password', 'email', 'textarea', 'senha', 'select', 'radio', 'checkbox', 'cpf', 'cnpj', 'phone', 'cep', 'data', 'hora', 'moeda', 'pis', 'placa', 'titulo', 'cnh', 'processo', 'renavam', 'sei'],
                'default'    => 'text',
            ],
            'col' => [
                'type'       => 'TINYINT',
                'default'    => 12,
            ],
            'label' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'field_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'field_key' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'placeholder' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'default_value' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'help_text' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'required' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'disabled' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'read_only' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'is_hidden' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'max_length' => [
                'type' => 'INT',
                'null' => true,
            ],
            'min_length' => [
                'type' => 'INT',
                'null' => true,
            ],
            'pattern' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'input_mode' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
            ],
            'autocomplete' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
                'null'       => true,
            ],
            'no_numbers' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'no_letters' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'no_special_chars' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'strong_password' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'double_field' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'with_seconds' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'show_counter' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'null'       => true,
            ],
            'inline' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'rows_qty' => [
                'type' => 'INT',
                'null' => true,
            ],
            'min_date' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
            ],
            'max_date' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
            ],
            'options_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'datalist_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'allowed_domains_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'select_config_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'style_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'attributes_json' => [
                'type' => 'JSON',
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
        $this->forge->addKey('form_row_id');
        $this->forge->addKey('field_type');
        $this->forge->addKey('sort_order');
        $this->forge->addForeignKey('form_row_id', 'form_rows', 'id', '', 'CASCADE', 'form_campos_form_row_id_foreign');
        $this->forge->createTable('form_fields');
    }

    public function down()
    {
        $this->forge->dropTable('form_fields');
    }
}
