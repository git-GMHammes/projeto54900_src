<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela form_campos — um campo de uma linha do formulario.
 *
 * Modela os atributos de QUALQUER componente de
 * src/frontend/projeto54900/src/components/ui/FormGrid. Abordagem hibrida:
 *
 *  - Colunas explicitas para o que a API/renderer precisa consultar/ordenar
 *    (tipo, col, label, name, placeholder, obrigatoriedade, limites, etc.).
 *  - Flags TINYINT(1) para as opcoes booleanas por tipo (noNumbers,
 *    strongPassword, doubleField, comSegundos, inline, ...).
 *  - Colunas JSON para a cauda longa e os arrays:
 *      options_json         -> radio/checkbox/select: [{id,value,label,checked}]
 *      datalist_json        -> text: ["opcao1","opcao2"]
 *      allowed_domains_json -> email: ["gov.br","com.br"]
 *      select_config_json   -> select: {src,valueKey,labelKey,labelTemplate,
 *                                       maxVisible,findSrc,findColumn,getSrc,authToken}
 *      style_json           -> CSSProperties do componente
 *      attributes_json      -> qualquer outro atributo (size,tabIndex,dir,lang,
 *                              spellCheck,autoFocus,title,className,value,cols...)
 *
 * FK para form_rows (CASCADE). field_type reproduz o discriminador `type` do
 * FormGrid (texto padrao = 'text').
 */
class CreateFormCamposTableMigration extends Migration
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
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],

            // -- Estrutura -------------------------------------------------------
            'field_type' => [
                'type'       => 'ENUM',
                'constraint' => [
                    'text', 'password', 'email', 'textarea', 'senha', 'select',
                    'radio', 'checkbox', 'cpf', 'cnpj', 'phone', 'cep', 'data',
                    'hora', 'moeda', 'pis', 'placa', 'titulo', 'cnh', 'processo',
                    'renavam', 'sei',
                ],
                'default'    => 'text',
            ],
            'col' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
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

            // -- Estado / validacao de forma ----------------------------------
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
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true,
            ],
            'min_length' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true,
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

            // -- Flags por tipo ---------------------------------------------------
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
            'equal_fields' => [
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
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true,
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

            // -- Cauda longa / arrays (JSON) -----------------------------------
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
        $this->forge->addForeignKey('form_row_id', 'form_rows', 'id', '', 'CASCADE');
        $this->forge->createTable('form_campos');
    }

    public function down()
    {
        $this->forge->dropTable('form_campos');
    }
}
