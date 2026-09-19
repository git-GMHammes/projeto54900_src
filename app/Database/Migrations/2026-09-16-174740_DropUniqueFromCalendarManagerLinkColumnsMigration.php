<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Correcao da migration anterior (AddModuleLinksToCalendarManagerTableMigration):
 * as 4 colunas de vinculo (user_manager_id, document_manager_id, map_manager_id,
 * networking_manager_id) tinham UNIQUE KEY, implicando 1-para-1. Decisao
 * revista pelo usuario em 2026-09-16: sao FK padrao N-para-1 (varios
 * calendarios podem apontar para o mesmo usuario/documento/mapa/mensagem) -
 * ex.: um documento pode estar em mais de um calendario. Remove so os
 * UNIQUE KEY; colunas e a FK real de user_manager_id continuam iguais.
 *
 * user_manager_id precisa de um indice comum antes de dropar o UNIQUE -
 * MySQL nao deixa remover o unico indice que sustenta uma FK ativa (erro
 * 1553). document/map/networking nao tem FK, entao dropam direto.
 */
class DropUniqueFromCalendarManagerLinkColumnsMigration extends Migration
{
    public function up()
    {
        $this->db->query('
            ALTER TABLE `calendar_manager`
            ADD KEY `calendar_manager_user_manager_id_index` (`user_manager_id`)
        ');

        $this->db->query('
            ALTER TABLE `calendar_manager`
            DROP KEY `calendar_manager_user_manager_id_unique`,
            DROP KEY `calendar_manager_document_manager_id_unique`,
            DROP KEY `calendar_manager_map_manager_id_unique`,
            DROP KEY `calendar_manager_networking_manager_id_unique`
        ');
    }

    public function down()
    {
        $this->db->query('
            ALTER TABLE `calendar_manager`
            ADD UNIQUE KEY `calendar_manager_user_manager_id_unique` (`user_manager_id`),
            ADD UNIQUE KEY `calendar_manager_document_manager_id_unique` (`document_manager_id`),
            ADD UNIQUE KEY `calendar_manager_map_manager_id_unique` (`map_manager_id`),
            ADD UNIQUE KEY `calendar_manager_networking_manager_id_unique` (`networking_manager_id`)
        ');

        $this->db->query('
            ALTER TABLE `calendar_manager`
            DROP KEY `calendar_manager_user_manager_id_index`
        ');
    }
}
