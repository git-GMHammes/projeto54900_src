<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Colunas de ligacao 1-para-1 (opcionais) entre calendar_manager e os demais
 * modulos do sistema (ver src/frontend/projeto54900/src/markdown/geral/modulos/
 * dos modulos futuros: User, Document Manager, Map, Networking). Cada coluna
 * ganha UNIQUE KEY (permite varios NULL, mas nenhum valor repetido) para
 * garantir o 1-para-1 - um calendario nao depende de nenhum desses vinculos
 * para existir.
 *
 * Só user_manager_id ganha FK de verdade (tabela user_manager já existe).
 * document_manager_id / map_manager_id / networking_manager_id ficam
 * reservadas como BIGINT NULL + UNIQUE, sem constraint de FK, ate os modulos
 * Document Manager / Map / Networking existirem - decisao explicita do
 * usuario em 2026-09-16, para nao travar a evolucao do calendario esperando
 * os outros modulos.
 *
 * ALTER TABLE em SQL cru (nao Forge) pelo mesmo motivo das views (ver
 * ROADMAP_padrao_modulo.md §9): adicionar coluna + FK numa tabela já
 * existente não é o caso comum que addField()/createTable() cobrem.
 */
class AddModuleLinksToCalendarManagerTableMigration extends Migration
{
    public function up()
    {
        $this->db->query('
            ALTER TABLE `calendar_manager`
            ADD COLUMN `user_manager_id` BIGINT NULL AFTER `status`,
            ADD COLUMN `document_manager_id` BIGINT NULL AFTER `user_manager_id`,
            ADD COLUMN `map_manager_id` BIGINT NULL AFTER `document_manager_id`,
            ADD COLUMN `networking_manager_id` BIGINT NULL AFTER `map_manager_id`,
            ADD UNIQUE KEY `calendar_manager_user_manager_id_unique` (`user_manager_id`),
            ADD UNIQUE KEY `calendar_manager_document_manager_id_unique` (`document_manager_id`),
            ADD UNIQUE KEY `calendar_manager_map_manager_id_unique` (`map_manager_id`),
            ADD UNIQUE KEY `calendar_manager_networking_manager_id_unique` (`networking_manager_id`)
        ');

        // Unico vinculo com tabela existente hoje: user_manager. Optativo
        // (SET NULL no delete) - remover o usuario nao deve apagar o
        // calendario, so desfazer o vinculo. Mesmo padrao de
        // calendar_events.recurring_event_id (FK opcional -> SET NULL).
        $this->db->query('
            ALTER TABLE `calendar_manager`
            ADD CONSTRAINT `calendar_manager_user_manager_id_foreign`
            FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`)
            ON DELETE SET NULL ON UPDATE CASCADE
        ');
    }

    public function down()
    {
        $this->db->query('
            ALTER TABLE `calendar_manager`
            DROP FOREIGN KEY `calendar_manager_user_manager_id_foreign`
        ');

        $this->db->query('
            ALTER TABLE `calendar_manager`
            DROP KEY `calendar_manager_user_manager_id_unique`,
            DROP KEY `calendar_manager_document_manager_id_unique`,
            DROP KEY `calendar_manager_map_manager_id_unique`,
            DROP KEY `calendar_manager_networking_manager_id_unique`,
            DROP COLUMN `user_manager_id`,
            DROP COLUMN `document_manager_id`,
            DROP COLUMN `map_manager_id`,
            DROP COLUMN `networking_manager_id`
        ');
    }
}
