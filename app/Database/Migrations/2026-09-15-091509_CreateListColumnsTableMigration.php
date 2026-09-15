<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

/**
 * Tabela list_columns — uma coluna de dados de uma listagem.
 *
 * Equivale a um item de ROW_BATCH_1 (webroot/js/sad/v1a/pages/*\/get_all.js):
 * mapeia um campo (ou concatenacao de campos) vindo das CHAVES da resposta da
 * API para uma coluna visivel da tabela, com formatacao e ordenacao proprias.
 * FK para list_manager (CASCADE).
 *
 * DDL:
 *   list_manager_id   BIGINT       NOT NULL  FK -> list_manager.id (CASCADE)
 *   sort_order        INT          NOT NULL DEFAULT 0   posicao da coluna na tabela
 *   label             VARCHAR(255) NOT NULL             cabecalho exibido
 *   field_key         VARCHAR(255) NULL                 chave principal vinda da API
 *   concat_json       JSON         NULL                 partes (campo/literal) concatenadas
 *                                                        no conteudo da celula, ex.:
 *                                                        [{"type":"field","key":"nome"},
 *                                                         {"type":"literal","value":" - "},
 *                                                         {"type":"field","key":"matricula"}]
 *   format            VARCHAR(30)  NOT NULL DEFAULT 'text'  cpf/cnpj/moeda/data/datetime/custom...
 *   cell_class        VARCHAR(120) NULL                 classe CSS extra no <td>
 *   fallback          VARCHAR(50)  NULL DEFAULT '—'     texto quando vazio/nulo
 *   sortable          TINYINT(1)   NOT NULL DEFAULT 0   habilita clique de ordenacao no <th>
 *   sort_key          VARCHAR(255) NULL                 chave enviada a API ao ordenar
 *                                                        (default = field_key quando nulo)
 *   sort_concat_json  JSON         NULL                 concatenar conteudo de mais de uma
 *                                                        coluna na ordenacao (sort composto)
 *   visible           TINYINT(1)   NOT NULL DEFAULT 1
 *   created_at / updated_at / deleted_at DATETIME (padrao + soft delete)
 */
class CreateListColumnsTableMigration extends Migration
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
            'field_key' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'concat_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'format' => [
                'type'       => 'VARCHAR',
                'constraint' => 30,
                'default'    => 'text',
            ],
            'cell_class' => [
                'type'       => 'VARCHAR',
                'constraint' => 120,
                'null'       => true,
            ],
            'fallback' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
                'default'    => '—',
            ],
            'sortable' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'sort_key' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'sort_concat_json' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'visible' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
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
        $this->forge->addKey('list_manager_id');
        $this->forge->addKey('sort_order');
        $this->forge->addForeignKey('list_manager_id', 'list_manager', 'id', '', 'CASCADE');
        $this->forge->createTable('list_columns');
    }

    public function down()
    {
        $this->forge->dropTable('list_columns');
    }
}
