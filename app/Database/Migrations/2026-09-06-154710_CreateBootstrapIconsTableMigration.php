<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela bootstrap_icons — catalogo dos icones do Bootstrap Icons.
 *
 * Origem dos dados: bootstrap-icons/font/bootstrap-icons.json
 * (nome do icone -> codepoint decimal do glifo na fonte, area de uso privado).
 *
 * Uso: alimentar o seletor de icone do construtor de formularios. A classe CSS
 * de cada linha e "bi bi-{name}".
 *
 * DDL:
 *   name        VARCHAR(255) NOT NULL            nome do icone, ex.: "alarm-fill" (unico)
 *   codepoint   INT          NOT NULL            codepoint decimal, ex.: 61697 (0xF101)
 *   is_favorite TINYINT(1)   NOT NULL DEFAULT 0  destaque na hora de escolher
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 *
 * Populada por seeder (passo separado).
 */
class CreateBootstrapIconsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'codepoint' => [
                'type'       => 'INT',
                'constraint' => 11,
            ],
            'is_favorite' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
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
        $this->forge->addUniqueKey('name');
        $this->forge->addKey('is_favorite');
        $this->forge->createTable('bootstrap_icons');
    }

    public function down()
    {
        $this->forge->dropTable('bootstrap_icons');
    }
}
