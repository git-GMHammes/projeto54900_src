<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * View view_user_manager — leitura consolidada de user_manager + user_profiles.
 *
 * Consumida por App\Models\V1\User\UserManager\SqlViewModel e pelos endpoints
 * REST de user-manager-view (API V1).
 *
 * Prefixos:
 *   um_ = colunas de user_manager
 *   uc_ = colunas de user_profiles (perfil 1:1 ligado por user_manager_id)
 *
 * id e os timestamps/deleted_at expostos são os de user_manager.
 */
class CreateViewUserManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_user_manager`');

        $this->db->query(<<<'SQL'
            CREATE VIEW `view_user_manager` AS
            SELECT
                um.id                 AS id,
                um.username           AS um_username,
                um.status             AS um_status,
                um.last_login_at      AS um_last_login_at,
                uc.id                 AS uc_id,
                uc.uuid               AS uc_uuid,
                uc.name               AS uc_name,
                uc.email              AS uc_email,
                uc.phone              AS uc_phone,
                uc.whatsapp           AS uc_whatsapp,
                uc.cpf                AS uc_cpf,
                uc.cep                AS uc_cep,
                uc.address            AS uc_address,
                um.created_at         AS created_at,
                um.updated_at         AS updated_at,
                um.deleted_at         AS deleted_at
            FROM `user_manager` um
            LEFT JOIN `user_profiles` uc
                ON uc.user_manager_id = um.id
               AND uc.deleted_at IS NULL
            SQL);
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_user_manager`');
    }
}
