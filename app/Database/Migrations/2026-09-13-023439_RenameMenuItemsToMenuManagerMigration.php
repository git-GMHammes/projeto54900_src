<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Renomeia menu_items -> menu_manager, e a coluna menu_id -> nav_manager_id.
 *
 * Motivo: reclassificacao semantica decidida pelo usuario. Esta tabela (arvore
 * de itens navegaveis, com parent_id/react_route/roles) e o Menu de verdade;
 * o nome menu_manager passa a ser dela. A FK muda de nome para nav_manager_id,
 * apontando para nav_manager (ver RenameMenuManagerToNavManagerMigration, que
 * precisa rodar ANTES desta para liberar o nome menu_manager).
 *
 * A constraint e o indice compostos em menu_id precisam ser dropados antes de
 * renomear a coluna (MySQL recusa DROP INDEX/CHANGE COLUMN em coluna presa a
 * uma FK cujo unico indice de suporte seria removido - erro 1553). Ordem:
 * drop FK -> drop indice -> renomeia coluna -> recria indice -> recria FK ->
 * renomeia tabela. down() desfaz na ordem inversa; nesse ponto do rollback
 * (migration desta roda antes da de nav_manager) a tabela pai ainda se chama
 * nav_manager, entao a FK recriada no down() aponta para nav_manager mesmo.
 */
class RenameMenuItemsToMenuManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('ALTER TABLE `menu_items` DROP FOREIGN KEY `menu_items_menu_id_foreign`');
        $this->db->query('ALTER TABLE `menu_items` DROP INDEX `menu_id_parent_id`');
        $this->db->query('ALTER TABLE `menu_items` CHANGE COLUMN `menu_id` `nav_manager_id` BIGINT NOT NULL');
        $this->db->query('ALTER TABLE `menu_items` ADD INDEX `nav_manager_id_parent_id` (`nav_manager_id`, `parent_id`)');
        $this->db->query(
            'ALTER TABLE `menu_items`
                ADD CONSTRAINT `menu_manager_nav_manager_id_foreign`
                FOREIGN KEY (`nav_manager_id`) REFERENCES `nav_manager` (`id`)
                ON DELETE CASCADE'
        );
        $this->db->query('RENAME TABLE `menu_items` TO `menu_manager`');
    }

    public function down()
    {
        $this->db->query('RENAME TABLE `menu_manager` TO `menu_items`');
        $this->db->query('ALTER TABLE `menu_items` DROP FOREIGN KEY `menu_manager_nav_manager_id_foreign`');
        $this->db->query('ALTER TABLE `menu_items` DROP INDEX `nav_manager_id_parent_id`');
        $this->db->query('ALTER TABLE `menu_items` CHANGE COLUMN `nav_manager_id` `menu_id` BIGINT NOT NULL');
        $this->db->query('ALTER TABLE `menu_items` ADD INDEX `menu_id_parent_id` (`menu_id`, `parent_id`)');
        $this->db->query(
            'ALTER TABLE `menu_items`
                ADD CONSTRAINT `menu_items_menu_id_foreign`
                FOREIGN KEY (`menu_id`) REFERENCES `nav_manager` (`id`)
                ON DELETE CASCADE'
        );
    }
}
