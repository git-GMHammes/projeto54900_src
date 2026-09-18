<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateViewUserManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_user_manager`');

        $this->db->query(<<<'SQL'
            CREATE VIEW `view_user_manager` AS
            SELECT
                um.id            AS id,
                um.username      AS um_username,
                um.status        AS um_status,
                um.user_role_id  AS um_user_role_id,
                um.last_login_at AS um_last_login_at,
                uc.id            AS uc_id,
                uc.uuid          AS uc_uuid,
                uc.name          AS uc_name,
                uc.email         AS uc_email,
                uc.phone         AS uc_phone,
                uc.whatsapp      AS uc_whatsapp,
                uc.cpf           AS uc_cpf,
                uc.cep           AS uc_cep,
                uc.address       AS uc_address,
                ur.slug          AS ur_role_slug,
                ur.name          AS ur_role_name,
                um.created_at    AS created_at,
                um.updated_at    AS updated_at,
                um.deleted_at    AS deleted_at
            FROM `user_manager` um
            LEFT JOIN `user_profiles` uc
                ON uc.user_manager_id = um.id
               AND uc.deleted_at IS NULL
            LEFT JOIN `user_roles` ur
                ON ur.id = um.user_role_id
               AND ur.deleted_at IS NULL
            SQL);
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_user_manager`');
    }
}
