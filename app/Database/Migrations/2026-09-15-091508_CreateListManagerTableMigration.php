<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela list_manager — a listagem/grid em si.
 *
 * Raiz do construtor de listas: list_manager 1:N list_columns, list_manager 1:N
 * list_actions (colecoes irmas, sem aninhamento). Alimenta grids dirigidos por
 * API (getAll/search), no espirito de webroot/js/sad/v1a/pages/*\/get_all.js
 * (ROW_BATCH_1 + ROW_BATCH_ACTIONS + estado _sort/_order/_limit).
 *
 * DDL:
 *   slug                VARCHAR(255)  NOT NULL UNIQUE       identificador estavel da lista
 *   title               VARCHAR(255)  NULL
 *   description         TEXT          NULL
 *   api_get_endpoint    VARCHAR(255)  NULL                  endpoint getAll (paginado)
 *   api_search_endpoint VARCHAR(255)  NULL                  endpoint search (opcional)
 *   roles               VARCHAR(255)  NULL                  perfis que veem a lista inteira (lista JSON de slugs)
 *   default_sort        VARCHAR(255)  NOT NULL DEFAULT 'id'
 *   default_order       ENUM('asc','desc') NOT NULL DEFAULT 'desc'
 *   default_limit       INT           NOT NULL DEFAULT 20   registros por pagina
 *   limit_options_json  JSON          NULL                  ex.: [10,20,50,100]
 *   status              ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft'
 *   version             INT           NOT NULL DEFAULT 1
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateListManagerTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
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
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'api_get_endpoint' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'api_search_endpoint' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'roles' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'default_sort' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'default'    => 'id',
            ],
            'default_order' => [
                'type'       => 'ENUM',
                'constraint' => ['asc', 'desc'],
                'default'    => 'desc',
            ],
            'default_limit' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 20,
            ],
            'limit_options_json' => [
                'type' => 'JSON',
                'null' => true,
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
        $this->forge->addKey('status');
        $this->forge->createTable('list_manager');
    }

    public function down()
    {
        $this->forge->dropTable('list_manager');
    }
}
