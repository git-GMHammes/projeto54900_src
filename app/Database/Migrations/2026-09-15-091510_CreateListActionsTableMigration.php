<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela list_actions — um botao de acao por linha de uma listagem.
 *
 * Equivale a um item de ROW_BATCH_ACTIONS (webroot/js/sad/v1a/pages/*\/get_all.js)
 * somado a matriz de permissoes por linha (getXxxPermissions(row) daqueles
 * arquivos): cada acao carrega tanto a regra de perfil (roles) quanto a regra
 * de negocio dependente do estado da linha (business_rule_json), ex.: so
 * permitir editar quando status_atual = 'Aprovada' e perfil = 'COFIN'.
 * FK para list_manager (CASCADE).
 *
 * DDL:
 *   list_manager_id     BIGINT       NOT NULL  FK -> list_manager.id (CASCADE)
 *   sort_order          INT          NOT NULL DEFAULT 0
 *   label               VARCHAR(255) NOT NULL             titulo/tooltip do botao
 *   icon                VARCHAR(120) NULL                 classe do icone (bi/fi/...)
 *   action_type         ENUM('link','api_call') NOT NULL DEFAULT 'link'
 *   href_template       VARCHAR(255) NULL                 URL com {id}, quando action_type=link
 *   api_endpoint        VARCHAR(255) NULL                 endpoint quando action_type=api_call
 *   http_method         VARCHAR(10)  NULL DEFAULT 'GET'
 *   data_action         VARCHAR(60)  NULL                 identificador (ver/editar/excluir/custom)
 *   target              VARCHAR(20)  NULL                 ex.: _blank
 *   confirm             TINYINT(1)   NOT NULL DEFAULT 0   exige confirm() antes de executar
 *   confirm_message     VARCHAR(255) NULL
 *   extra_data_json     JSON         NULL                 data-* extras vindos de outras chaves
 *                                                          da linha, ex.: [{"name":"nome","key":"sf_nome_completo","fallback":""}]
 *   roles               VARCHAR(255) NULL                 perfis permitidos (lista JSON de slugs)
 *   business_rule_json  JSON         NULL                 condicao sobre o dado da linha, ex.:
 *                                                          {"field":"status_atual","op":"eq","value":"Aprovada"}
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateListActionsTableMigration extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'auto_increment' => true,
            ],
            'list_manager_id' => [
                'type' => 'BIGINT',
            ],
            'sort_order' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
            ],
            'label' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'icon' => [
                'type'       => 'VARCHAR',
                'constraint' => 120,
                'null'       => true,
            ],
            'action_type' => [
                'type'       => 'ENUM',
                'constraint' => ['link', 'api_call'],
                'default'    => 'link',
            ],
            'href_template' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'api_endpoint' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'http_method' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
                'default'    => 'GET',
            ],
            'data_action' => [
                'type'       => 'VARCHAR',
                'constraint' => 60,
                'null'       => true,
            ],
            'target' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'null'       => true,
            ],
            'confirm' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'confirm_message' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'extra_data_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'roles' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'business_rule_json' => [
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
        $this->forge->addKey('list_manager_id');
        $this->forge->addKey('sort_order');
        $this->forge->addForeignKey('list_manager_id', 'list_manager', 'id', '', 'CASCADE');
        $this->forge->createTable('list_actions');
    }

    public function down()
    {
        $this->forge->dropTable('list_actions');
    }
}
