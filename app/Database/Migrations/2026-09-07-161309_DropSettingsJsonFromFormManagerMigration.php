<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Remove a coluna settings_json de form_manager.
 *
 * Motivo: settings_json (JSON NULL, "catch-all de layout") nunca ganhou
 * contrato nem consumidor — nenhum codigo le a coluna. form_campos ja carrega
 * config JSON por campo; config no nivel do formulario nao tem feature que
 * precise dela. Readicionar depois e uma migration de uma linha.
 *
 * up():   dropColumn(settings_json) + recria view_form_manager sem fm_settings_json.
 * down(): readiciona a coluna (JSON NULL) e a view com ela.
 */
class DropSettingsJsonFromFormManagerMigration extends Migration
{
    public function up()
    {
        $this->forge->dropColumn('form_manager', 'settings_json');
        $this->recreateView(false);
    }

    public function down()
    {
        $this->forge->addColumn('form_manager', [
            'settings_json' => [
                'type'  => 'JSON',
                'null'  => true,
                'after' => 'version',
            ],
        ]);
        $this->recreateView(true);
    }

    /**
     * Recria view_form_manager. Com $withSettingsJson = true inclui a coluna
     * fm_settings_json (estado anterior a esta migration).
     */
    private function recreateView(bool $withSettingsJson): void
    {
        $this->db->query('DROP VIEW IF EXISTS `view_form_manager`');

        $settingsJson = $withSettingsJson
            ? "fm.settings_json        AS fm_settings_json,\n\n                "
            : '';

        $template = <<<'SQL'
            CREATE VIEW `view_form_manager` AS
            SELECT
                fc.id                   AS id,

                fm.id                   AS fm_id,
                fm.slug                 AS fm_slug,
                fm.title                AS fm_title,
                fm.description          AS fm_description,
                fm.profile_group        AS fm_profile_group,
                fm.react_route          AS fm_react_route,
                fm.submit_endpoint      AS fm_submit_endpoint,
                fm.http_method          AS fm_http_method,
                fm.status               AS fm_status,
                fm.version              AS fm_version,
                %sfg.id                   AS fg_id,
                fg.title                AS fg_title,
                fg.slug                 AS fg_slug,
                fg.description          AS fg_description,
                fg.icon                 AS fg_icon,
                fg.sort_order           AS fg_sort_order,
                fg.collapsed            AS fg_collapsed,

                fr.id                   AS fr_id,
                fr.sort_order           AS fr_sort_order,
                fr.label                AS fr_label,
                fr.gutter               AS fr_gutter,
                fr.note                 AS fr_note,

                fc.id                   AS fc_id,
                fc.sort_order           AS fc_sort_order,
                fc.field_type           AS fc_field_type,
                fc.col                  AS fc_col,
                fc.label                AS fc_label,
                fc.field_name           AS fc_field_name,
                fc.field_key            AS fc_field_key,
                fc.placeholder          AS fc_placeholder,
                fc.default_value        AS fc_default_value,
                fc.help_text            AS fc_help_text,
                fc.required             AS fc_required,
                fc.disabled             AS fc_disabled,
                fc.read_only            AS fc_read_only,
                fc.is_hidden            AS fc_is_hidden,
                fc.max_length           AS fc_max_length,
                fc.min_length           AS fc_min_length,
                fc.pattern              AS fc_pattern,
                fc.input_mode           AS fc_input_mode,
                fc.autocomplete         AS fc_autocomplete,
                fc.no_numbers           AS fc_no_numbers,
                fc.no_letters           AS fc_no_letters,
                fc.no_special_chars     AS fc_no_special_chars,
                fc.strong_password      AS fc_strong_password,
                fc.double_field         AS fc_double_field,
                fc.equal_fields         AS fc_equal_fields,
                fc.with_seconds         AS fc_with_seconds,
                fc.show_counter         AS fc_show_counter,
                fc.inline               AS fc_inline,
                fc.rows_qty             AS fc_rows_qty,
                fc.min_date             AS fc_min_date,
                fc.max_date             AS fc_max_date,
                fc.options_json         AS fc_options_json,
                fc.datalist_json        AS fc_datalist_json,
                fc.allowed_domains_json AS fc_allowed_domains_json,
                fc.select_config_json   AS fc_select_config_json,
                fc.style_json           AS fc_style_json,
                fc.attributes_json      AS fc_attributes_json,

                fm.created_at           AS created_at,
                fm.updated_at           AS updated_at,
                fm.deleted_at           AS deleted_at
            FROM `form_manager` fm
            LEFT JOIN `form_groups` fg
                ON fg.form_manager_id = fm.id
               AND fg.deleted_at IS NULL
            LEFT JOIN `form_rows` fr
                ON fr.form_group_id = fg.id
               AND fr.deleted_at IS NULL
            LEFT JOIN `form_campos` fc
                ON fc.form_row_id = fr.id
               AND fc.deleted_at IS NULL
            WHERE fm.deleted_at IS NULL
            SQL;

        $this->db->query(\sprintf($template, $settingsJson));
    }
}
