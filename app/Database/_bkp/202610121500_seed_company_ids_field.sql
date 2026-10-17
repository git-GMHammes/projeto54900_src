-- Campo Empresa (company_ids) no formulario 'cadastro-usuario' (form_manager.table_name = user_manager).
-- Checkbox (um por empresa) com as empresas de /api/v1/company-manager-public/get-no-pagination.
-- Idempotente: so insere se a linha/campo ainda nao existir. Nao usa ids fixos.
-- Rollback: DELETE dos registros com field_key = 'company_ids' (e a form_row com note = 'Empresa' do grupo).

INSERT INTO `form_rows` (`form_group_id`, `sort_order`, `gutter`, `note`, `created_at`, `updated_at`)
SELECT g.`id`, 3, 'g-3', 'Empresa', NOW(), NOW()
FROM `form_groups` g
JOIN `form_manager` m ON m.`id` = g.`form_manager_id` AND m.`slug` = 'cadastro-usuario'
WHERE g.`slug` = 'criacao-de-seguranca'
  AND NOT EXISTS (
    SELECT 1 FROM `form_rows` r WHERE r.`form_group_id` = g.`id` AND r.`note` = 'Empresa' AND r.`deleted_at` IS NULL
  );

INSERT INTO `form_fields` (`form_row_id`, `sort_order`, `field_type`, `col`, `label`, `field_name`, `field_key`, `placeholder`, `default_value`, `help_text`, `required`, `disabled`, `read_only`, `is_hidden`, `max_length`, `min_length`, `pattern`, `input_mode`, `autocomplete`, `no_numbers`, `no_letters`, `no_special_chars`, `strong_password`, `double_field`, `equal_fields`, `with_seconds`, `show_counter`, `inline`, `rows_qty`, `min_date`, `max_date`, `options_json`, `datalist_json`, `allowed_domains_json`, `select_config_json`, `style_json`, `attributes_json`, `created_at`, `updated_at`)
SELECT r.`id`, 1, 'checkbox', 6, 'Empresa', 'company_ids', 'company_ids', NULL, NULL, 'Empresas que o usuario podera acessar.', 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
       '{"src": "/api/v1/company-manager-public/get-no-pagination", "valueKey": "id", "labelKey": "name"}', NULL, NULL, NOW(), NOW()
FROM `form_rows` r
JOIN `form_groups` g ON g.`id` = r.`form_group_id` AND g.`slug` = 'criacao-de-seguranca'
JOIN `form_manager` m ON m.`id` = g.`form_manager_id` AND m.`slug` = 'cadastro-usuario'
WHERE r.`note` = 'Empresa' AND r.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM `form_fields` f WHERE f.`form_row_id` = r.`id` AND f.`field_key` = 'company_ids' AND f.`deleted_at` IS NULL
  );
