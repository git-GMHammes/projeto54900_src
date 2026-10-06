--  
-- Views do banco codeigniter54900_db — dump formatado em 2026-09-20.
-- Fonte: SHOW CREATE VIEW de cada uma (estado real do banco nesta data).
-- Ordem: view_calendar_manager, view_form_manager, view_upload_manager,
-- view_user_manager.
--  
SET NAMES utf8mb4;
-- -----------------------------------------------------------------------------
-- view_calendar_manager
-- calendar_manager (cm) LEFT JOIN calendar_events (ce) — só 2 níveis, de
-- propósito: os 4 ramos-filhos de calendar_events (attendees, reminders,
-- attachments, extended_properties) ficam FORA, evitando produto cartesiano.
-- Um calendário sem eventos ainda aparece (LEFT JOIN), com todo ce_* NULL.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_manager`;
CREATE VIEW `view_calendar_manager` AS
SELECT ce.id AS id,
    cm.id AS cm_id,
    cm.google_calendar_id AS cm_google_calendar_id,
    cm.summary AS cm_summary,
    cm.description AS cm_description,
    cm.time_zone AS cm_time_zone,
    cm.location AS cm_location,
    cm.background_color AS cm_background_color,
    cm.foreground_color AS cm_foreground_color,
    cm.access_role AS cm_access_role,
    cm.is_primary AS cm_is_primary,
    cm.status AS cm_status,
    cm.user_manager_id AS cm_user_manager_id,
    cm.document_manager_id AS cm_document_manager_id,
    cm.map_manager_id AS cm_map_manager_id,
    cm.networking_manager_id AS cm_networking_manager_id,
    ce.id AS ce_id,
    ce.calendar_id AS ce_calendar_id,
    ce.google_event_id AS ce_google_event_id,
    ce.ical_uid AS ce_ical_uid,
    ce.status AS ce_status,
    ce.summary AS ce_summary,
    ce.description AS ce_description,
    ce.location AS ce_location,
    ce.start_date AS ce_start_date,
    ce.start_datetime AS ce_start_datetime,
    ce.start_time_zone AS ce_start_time_zone,
    ce.end_date AS ce_end_date,
    ce.end_datetime AS ce_end_datetime,
    ce.end_time_zone AS ce_end_time_zone,
    ce.recurrence AS ce_recurrence,
    ce.recurring_event_id AS ce_recurring_event_id,
    ce.sequence AS ce_sequence,
    ce.transparency AS ce_transparency,
    ce.visibility AS ce_visibility,
    ce.color_id AS ce_color_id,
    ce.event_type AS ce_event_type,
    ce.guests_can_modify AS ce_guests_can_modify,
    ce.guests_can_invite_others AS ce_guests_can_invite_others,
    ce.guests_can_see_other_guests AS ce_guests_can_see_other_guests,
    ce.anyone_can_add_self AS ce_anyone_can_add_self,
    ce.html_link AS ce_html_link,
    ce.google_created_at AS ce_google_created_at,
    ce.google_updated_at AS ce_google_updated_at,
    cm.created_at AS created_at,
    cm.updated_at AS updated_at,
    cm.deleted_at AS deleted_at
FROM `calendar_manager` cm
    LEFT JOIN `calendar_events` ce ON ce.calendar_id = cm.id
    AND ce.deleted_at IS NULL
WHERE cm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_form_manager
-- form_manager (fm) → form_groups (fg) → form_rows (fr) → form_fields (fc) —
-- achata os 4 níveis, 1 linha por campo. `id` = form_fields.id (pode ser NULL
-- num ramo sem campos). Cada LEFT JOIN filtra deleted_at IS NULL do próprio
-- nível.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_form_manager`;
CREATE VIEW `view_form_manager` AS
SELECT fc.id AS id,
    fm.id AS fm_id,
    fm.slug AS fm_slug,
    fm.table_name AS fm_table_name,
    fm.title AS fm_title,
    fm.description AS fm_description,
    fm.roles AS fm_roles,
    fm.react_route AS fm_react_route,
    fm.submit_endpoint AS fm_submit_endpoint,
    fm.http_method AS fm_http_method,
    fm.status AS fm_status,
    fm.version AS fm_version,
    fg.id AS fg_id,
    fg.title AS fg_title,
    fg.slug AS fg_slug,
    fg.description AS fg_description,
    fg.icon AS fg_icon,
    fg.sort_order AS fg_sort_order,
    fg.collapsed AS fg_collapsed,
    fr.id AS fr_id,
    fr.sort_order AS fr_sort_order,
    fr.gutter AS fr_gutter,
    fr.note AS fr_note,
    fc.id AS fc_id,
    fc.sort_order AS fc_sort_order,
    fc.field_type AS fc_field_type,
    fc.col AS fc_col,
    fc.label AS fc_label,
    fc.field_name AS fc_field_name,
    fc.field_key AS fc_field_key,
    fc.placeholder AS fc_placeholder,
    fc.default_value AS fc_default_value,
    fc.help_text AS fc_help_text,
    fc.required AS fc_required,
    fc.disabled AS fc_disabled,
    fc.read_only AS fc_read_only,
    fc.is_hidden AS fc_is_hidden,
    fc.max_length AS fc_max_length,
    fc.min_length AS fc_min_length,
    fc.pattern AS fc_pattern,
    fc.input_mode AS fc_input_mode,
    fc.autocomplete AS fc_autocomplete,
    fc.no_numbers AS fc_no_numbers,
    fc.no_letters AS fc_no_letters,
    fc.no_special_chars AS fc_no_special_chars,
    fc.strong_password AS fc_strong_password,
    fc.double_field AS fc_double_field,
    fc.with_seconds AS fc_with_seconds,
    fc.show_counter AS fc_show_counter,
    fc.inline AS fc_inline,
    fc.rows_qty AS fc_rows_qty,
    fc.min_date AS fc_min_date,
    fc.max_date AS fc_max_date,
    fc.options_json AS fc_options_json,
    fc.datalist_json AS fc_datalist_json,
    fc.allowed_domains_json AS fc_allowed_domains_json,
    fc.select_config_json AS fc_select_config_json,
    fc.style_json AS fc_style_json,
    fc.attributes_json AS fc_attributes_json,
    fm.created_at AS created_at,
    fm.updated_at AS updated_at,
    fm.deleted_at AS deleted_at
FROM `form_manager` fm
    LEFT JOIN `form_groups` fg ON fg.form_manager_id = fm.id
    AND fg.deleted_at IS NULL
    LEFT JOIN `form_rows` fr ON fr.form_group_id = fg.id
    AND fr.deleted_at IS NULL
    LEFT JOIN `form_fields` fc ON fc.form_row_id = fr.id
    AND fc.deleted_at IS NULL
WHERE fm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_upload_manager
-- Projeção direta de uploads (sem JOIN) — colunas prefixadas up_.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_upload_manager`;
CREATE VIEW `view_upload_manager` AS
SELECT u.id AS id,
    u.module AS up_module,
    u.reference_id AS up_reference_id,
    u.collection AS up_collection,
    u.file_key AS up_file_key,
    u.original_name AS up_original_name,
    u.stored_name AS up_stored_name,
    u.storage_path AS up_storage_path,
    u.file_url AS up_file_url,
    u.mime_type AS up_mime_type,
    u.extension AS up_extension,
    u.file_size AS up_file_size,
    u.category AS up_category,
    u.title AS up_title,
    u.description AS up_description,
    u.status AS up_status,
    u.created_at AS created_at,
    u.updated_at AS updated_at,
    u.deleted_at AS deleted_at
FROM `uploads` u;
-- -----------------------------------------------------------------------------
-- view_user_manager
-- user_manager (um) LEFT JOIN user_profiles (uc) LEFT JOIN user_roles (ur).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_manager`;
CREATE VIEW `view_user_manager` AS
SELECT um.id AS id,
    um.username AS um_username,
    um.status AS um_status,
    um.user_role_id AS um_user_role_id,
    um.last_login_at AS um_last_login_at,
    uc.id AS uc_id,
    uc.uuid AS uc_uuid,
    uc.name AS uc_name,
    uc.email AS uc_email,
    uc.phone AS uc_phone,
    uc.whatsapp AS uc_whatsapp,
    uc.cpf AS uc_cpf,
    uc.cep AS uc_cep,
    uc.address AS uc_address,
    ur.slug AS ur_role_slug,
    ur.name AS ur_role_name,
    um.created_at AS created_at,
    um.updated_at AS updated_at,
    um.deleted_at AS deleted_at
FROM `user_manager` um
    LEFT JOIN `user_profiles` uc ON uc.user_manager_id = um.id
    AND uc.deleted_at IS NULL
    LEFT JOIN `user_roles` ur ON ur.id = um.user_role_id
    AND ur.deleted_at IS NULL;