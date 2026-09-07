<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Adiciona user_manager.user_role_id — 1 perfil por usuario.
 *
 * BIGINT NULL, FK -> user_roles(id), ON DELETE SET NULL / ON UPDATE CASCADE.
 * Apagar um perfil solta o vinculo (user_role_id vira NULL); nao apaga o usuario.
 * Usuario sem perfil = NULL.
 *
 * up(): ADD COLUMN (depois de status) + indice + constraint fk_user_manager_user_role.
 * down(): remove a FK e a coluna.
 *
 * Roda na conexao default (codeigniter54900_db), sem --group, igual as demais
 * migrations do dominio User.
 */
class AddUserRoleIdToUserManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('ALTER TABLE `user_manager` ADD COLUMN `user_role_id` BIGINT NULL AFTER `status`');
        $this->db->query('ALTER TABLE `user_manager` ADD INDEX `user_role_id` (`user_role_id`)');
        $this->db->query(
            "ALTER TABLE `user_manager`
                ADD CONSTRAINT `fk_user_manager_user_role`
                FOREIGN KEY (`user_role_id`) REFERENCES `user_roles` (`id`)
                ON DELETE SET NULL ON UPDATE CASCADE"
        );
    }

    public function down()
    {
        $this->db->query('ALTER TABLE `user_manager` DROP FOREIGN KEY `fk_user_manager_user_role`');
        $this->db->query('ALTER TABLE `user_manager` DROP COLUMN `user_role_id`');
    }
}
