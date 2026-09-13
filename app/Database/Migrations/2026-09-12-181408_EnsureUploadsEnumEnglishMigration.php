<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Garante explicitamente os valores em ingles dos enums de uploads.
 *
 * uploads.category e uploads.status ja nasceram em ingles na migration
 * original (2026-09-05-223100_CreateUploadManagerTableMigration.php) e o
 * banco default confere (SHOW CREATE TABLE). Esta migration formaliza essa
 * garantia via ALTER TABLE MODIFY COLUMN, deixando a lista de valores
 * explicita e rastreavel no historico — sem alterar dado nem schema
 * visivel (mesmo tipo, mesmos defaults, mesma nulabilidade).
 *
 * category: image, video, audio, document, spreadsheet, presentation, pdf,
 * archive, other (default 'other').
 * status: active, inactive (default 'active').
 */
class EnsureUploadsEnumEnglishMigration extends Migration
{
    public function up()
    {
        $this->db->query(
            "ALTER TABLE `uploads`
                MODIFY COLUMN `category` ENUM('image','video','audio','document','spreadsheet','presentation','pdf','archive','other')
                NOT NULL DEFAULT 'other'"
        );
        $this->db->query(
            "ALTER TABLE `uploads`
                MODIFY COLUMN `status` ENUM('active','inactive')
                NOT NULL DEFAULT 'active'"
        );
    }

    public function down()
    {
        $this->db->query(
            "ALTER TABLE `uploads`
                MODIFY COLUMN `category` ENUM('image','video','audio','document','spreadsheet','presentation','pdf','archive','other')
                NOT NULL DEFAULT 'other'"
        );
        $this->db->query(
            "ALTER TABLE `uploads`
                MODIFY COLUMN `status` ENUM('active','inactive')
                NOT NULL DEFAULT 'active'"
        );
    }
}
