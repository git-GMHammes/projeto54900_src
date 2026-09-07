<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Renomeia a tabela form_campos -> form_fields.
 *
 * form_campos era a unica tabela do modulo Form em portugues; as irmas sao
 * form_manager, form_groups e form_rows. Escopo A: so a tabela. O modulo PHP
 * (FormCampos), a rota /api/v1/form-campos e o prefixo `fc_` da view seguem
 * como estao — padronizacao completa e Escopo B, a parte.
 *
 * As migrations historicas (012303 cria form_campos; 012304/151717/161309/164602
 * recriam a view com LEFT JOIN form_campos) NAO sao editadas — registram
 * fielmente o estado da epoca. Esta migration faz o RENAME e recria a view com
 * form_fields; no rollback (ordem reversa) o down() renomeia de volta antes de
 * qualquer down() antigo rodar.
 *
 * A FK form_row_id -> form_rows.id o MySQL preserva no RENAME TABLE.
 */
class RenameFormCamposToFormFieldsMigration extends Migration
{
    public function up()
    {
        $this->forge->renameTable('form_campos', 'form_fields');
        $this->recreateView('form_fields');
    }

    public function down()
    {
        $this->forge->renameTable('form_fields', 'form_campos');
        $this->recreateView('form_campos');
    }

    /** Recria view_form_manager fazendo LEFT JOIN na tabela de campos informada. */
    private function recreateView(string $camposTable): void
    {
        $this->db->query('DROP VIEW IF EXISTS `view_form_manager`');

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
                fg.id                   AS fg_id,
                fg.title                AS fg_title,
                fg.slug                 AS fg_slug,
                fg.description          AS fg_description,
                fg.icon                 AS fg_icon,
                fg.sort_order           AS fg_sort_order,
                fg.collapsed            AS fg_collapsed,

                fr.id                   AS fr_id,
                fr.sort_order           AS fr_sort_order,
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
            LEFT JOIN `%s` fc
                ON fc.form_row_id = fr.id
               AND fc.deleted_at IS NULL
            WHERE fm.deleted_at IS NULL
            SQL;

        $this->db->query(\sprintf($template, $camposTable));
    }
}
