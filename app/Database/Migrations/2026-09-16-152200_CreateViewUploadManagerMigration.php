<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateViewUploadManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_upload_manager`');

        $this->db->query(<<<'SQL'
            CREATE VIEW `view_upload_manager` AS
            SELECT
                u.id            AS id,
                u.module        AS up_module,
                u.reference_id  AS up_reference_id,
                u.collection    AS up_collection,
                u.file_key      AS up_file_key,
                u.original_name AS up_original_name,
                u.stored_name   AS up_stored_name,
                u.storage_path  AS up_storage_path,
                u.file_url      AS up_file_url,
                u.mime_type     AS up_mime_type,
                u.extension     AS up_extension,
                u.file_size     AS up_file_size,
                u.category      AS up_category,
                u.title         AS up_title,
                u.description   AS up_description,
                u.status        AS up_status,
                u.created_at    AS created_at,
                u.updated_at    AS updated_at,
                u.deleted_at    AS deleted_at
            FROM `uploads` u
            SQL);
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_upload_manager`');
    }
}
