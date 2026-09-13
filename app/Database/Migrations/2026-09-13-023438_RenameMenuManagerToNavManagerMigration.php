<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Renomeia menu_manager -> nav_manager.
 *
 * Motivo: reclassificacao semantica decidida pelo usuario apos o modulo Menu
 * entrar em uso. Esta tabela guarda title/image/message_icon/system_version -
 * config de branding do app/navbar (NAV), nao a arvore de menu em si.
 * A arvore de itens navegaveis (antes menu_items) passa a se chamar
 * menu_manager (ver RenameMenuItemsToMenuManagerMigration, que roda depois
 * desta para poder ocupar o nome liberado aqui).
 *
 * MySQL/InnoDB atualiza automaticamente as FKs de outras tabelas que
 * referenciam menu_manager (hoje: menu_items.menu_id) ao renomear a tabela.
 */
class RenameMenuManagerToNavManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('RENAME TABLE `menu_manager` TO `nav_manager`');
    }

    public function down()
    {
        $this->db->query('RENAME TABLE `nav_manager` TO `menu_manager`');
    }
}
