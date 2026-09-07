<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela form_manager — o formulario dinamico em si.
 *
 * Raiz da arvore Form: form_manager 1:N form_groups 1:N form_rows 1:N form_campos.
 * Consumida pelo modulo Form/FormManager (API V1) e pela view view_form_manager.
 *
 * DDL:
 *   name            VARCHAR(255)  NOT NULL              nome interno do formulario
 *   slug            VARCHAR(255)  NOT NULL UNIQUE       identificador estavel
 *   title           VARCHAR(255)  NULL                  titulo exibido no topo
 *   subtitle        VARCHAR(255)  NULL
 *   description     TEXT          NULL
 *   profile_group   VARCHAR(255)  NULL                  grupo de perfil dono do formulario
 *   react_route     VARCHAR(255)  NULL                  rota do React onde o form fica ativo
 *   submit_endpoint VARCHAR(255)  NULL                  para onde o form envia os dados
 *   http_method     VARCHAR(10)   NULL DEFAULT 'POST'
 *   status          ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *   version         INT           NOT NULL DEFAULT 1
 *   settings_json   JSON          NULL                  catch-all de layout/estilo
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateFormManagerTableMigration extends Migration
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
            'slug' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'subtitle' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'profile_group' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'react_route' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'submit_endpoint' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'http_method' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
                'default'    => 'POST',
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['draft', 'active', 'inactive'],
                'default'    => 'draft',
            ],
            'version' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 1,
            ],
            'settings_json' => [
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
        $this->forge->addUniqueKey('slug');
        $this->forge->addKey('profile_group');
        $this->forge->addKey('status');
        $this->forge->createTable('form_manager');
    }

    public function down()
    {
        $this->forge->dropTable('form_manager');
    }
}
