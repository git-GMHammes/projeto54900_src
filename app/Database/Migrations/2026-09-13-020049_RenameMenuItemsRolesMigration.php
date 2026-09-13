<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Renomeia menu_items.permissions -> roles.
 *
 * Motivo: padronizacao de nomenclatura (ver README_campo_json_montado.md do
 * frontend). O campo guarda uma lista JSON de slugs de user_roles (quem pode
 * ver o item de menu) - o nome correto para isso e 'roles', nao 'permissions'
 * (que em user_roles.permissions ja significa outra coisa: acoes granulares).
 * Tipo da coluna nao muda (continua JSON).
 */
class RenameMenuItemsRolesMigration extends Migration
{
    public function up()
    {
        $this->db->query('ALTER TABLE `menu_items` CHANGE COLUMN `permissions` `roles` JSON NULL');
    }

    public function down()
    {
        $this->db->query('ALTER TABLE `menu_items` CHANGE COLUMN `roles` `permissions` JSON NULL');
    }
}
