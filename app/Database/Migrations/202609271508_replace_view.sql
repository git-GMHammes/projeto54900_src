-- -----------------------------------------------------------------------------
-- Views do banco codeigniter54900_db — dump formatado em 2026-09-27.
-- Fonte: definição real de cada view no banco, nesta data.
-- Ordem: view_calendar_manager, view_form_manager, view_timeline_manager,
-- view_timeline_post_attachments, view_timeline_post_comments,
-- view_timeline_post_ratings, view_timeline_post_reactions,
-- view_timeline_post_reports, view_timeline_posts, view_upload_manager,
-- view_user_directory, view_user_manager.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
-- -----------------------------------------------------------------------------
-- view_calendar_manager
-- calendar_manager (cm) + calendar_events (ce), junção à esquerda — um
-- calendário sem eventos ainda aparece, com todo ce_* vazio. O id exposto é o
-- do evento (ce); as datas de auditoria ficam com o calendário. Os quatro
-- ramos-filhos de calendar_events ficam de fora, de propósito, para não gerar
-- produto cartesiano.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_manager`;
CREATE VIEW `view_calendar_manager` AS
SELECT  ce.id                          AS id
       ,cm.id                          AS cm_id
       ,cm.google_calendar_id          AS cm_google_calendar_id
       ,cm.summary                     AS cm_summary
       ,cm.description                 AS cm_description
       ,cm.time_zone                   AS cm_time_zone
       ,cm.location                    AS cm_location
       ,cm.background_color            AS cm_background_color
       ,cm.foreground_color            AS cm_foreground_color
       ,cm.access_role                 AS cm_access_role
       ,cm.is_primary                  AS cm_is_primary
       ,cm.status                      AS cm_status
       ,cm.sort_order                  AS cm_sort_order
       ,cm.user_manager_id             AS cm_user_manager_id
       ,cm.document_manager_id         AS cm_document_manager_id
       ,cm.map_manager_id              AS cm_map_manager_id
       ,cm.networking_manager_id       AS cm_networking_manager_id
       ,ce.id                          AS ce_id
       ,ce.calendar_id                 AS ce_calendar_id
       ,ce.google_event_id             AS ce_google_event_id
       ,ce.ical_uid                    AS ce_ical_uid
       ,ce.status                      AS ce_status
       ,ce.summary                     AS ce_summary
       ,ce.description                 AS ce_description
       ,ce.location                    AS ce_location
       ,ce.start_date                  AS ce_start_date
       ,ce.start_datetime              AS ce_start_datetime
       ,ce.start_time_zone             AS ce_start_time_zone
       ,ce.end_date                    AS ce_end_date
       ,ce.end_datetime                AS ce_end_datetime
       ,ce.end_time_zone               AS ce_end_time_zone
       ,ce.recurrence                  AS ce_recurrence
       ,ce.recurring_event_id          AS ce_recurring_event_id
       ,ce.sequence                    AS ce_sequence
       ,ce.transparency                AS ce_transparency
       ,ce.visibility                  AS ce_visibility
       ,ce.color_id                    AS ce_color_id
       ,ce.event_type                  AS ce_event_type
       ,ce.guests_can_modify           AS ce_guests_can_modify
       ,ce.guests_can_invite_others    AS ce_guests_can_invite_others
       ,ce.guests_can_see_other_guests AS ce_guests_can_see_other_guests
       ,ce.anyone_can_add_self         AS ce_anyone_can_add_self
       ,ce.html_link                   AS ce_html_link
       ,ce.google_created_at           AS ce_google_created_at
       ,ce.google_updated_at           AS ce_google_updated_at
       ,cm.created_at                  AS created_at
       ,cm.updated_at                  AS updated_at
       ,cm.deleted_at                  AS deleted_at
FROM `calendar_manager` cm
LEFT JOIN `calendar_events` ce
ON ce.calendar_id = cm.id AND ce.deleted_at IS NULL
WHERE cm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_form_manager
-- form_manager (fm) → form_groups (fg) → form_rows (fr) → form_fields (fc),
-- quatro níveis achatados, uma linha por campo. O id exposto é o do campo
-- (fc); as datas de auditoria ficam com o formulário. Cada junção descarta os
-- registros com deleted_at preenchido do próprio nível.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_form_manager`;
CREATE VIEW `view_form_manager` AS
SELECT  fc.id                   AS id
       ,fm.id                   AS fm_id
       ,fm.slug                 AS fm_slug
       ,fm.table_name           AS fm_table_name
       ,fm.title                AS fm_title
       ,fm.description          AS fm_description
       ,fm.roles                AS fm_roles
       ,fm.react_route          AS fm_react_route
       ,fm.submit_endpoint      AS fm_submit_endpoint
       ,fm.http_method          AS fm_http_method
       ,fm.status               AS fm_status
       ,fm.version              AS fm_version
       ,fg.id                   AS fg_id
       ,fg.title                AS fg_title
       ,fg.slug                 AS fg_slug
       ,fg.description          AS fg_description
       ,fg.icon                 AS fg_icon
       ,fg.sort_order           AS fg_sort_order
       ,fg.collapsed            AS fg_collapsed
       ,fr.id                   AS fr_id
       ,fr.sort_order           AS fr_sort_order
       ,fr.gutter               AS fr_gutter
       ,fr.note                 AS fr_note
       ,fc.id                   AS fc_id
       ,fc.sort_order           AS fc_sort_order
       ,fc.field_type           AS fc_field_type
       ,fc.col                  AS fc_col
       ,fc.label                AS fc_label
       ,fc.field_name           AS fc_field_name
       ,fc.field_key            AS fc_field_key
       ,fc.placeholder          AS fc_placeholder
       ,fc.default_value        AS fc_default_value
       ,fc.help_text            AS fc_help_text
       ,fc.required             AS fc_required
       ,fc.disabled             AS fc_disabled
       ,fc.read_only            AS fc_read_only
       ,fc.is_hidden            AS fc_is_hidden
       ,fc.max_length           AS fc_max_length
       ,fc.min_length           AS fc_min_length
       ,fc.pattern              AS fc_pattern
       ,fc.input_mode           AS fc_input_mode
       ,fc.autocomplete         AS fc_autocomplete
       ,fc.no_numbers           AS fc_no_numbers
       ,fc.no_letters           AS fc_no_letters
       ,fc.no_special_chars     AS fc_no_special_chars
       ,fc.strong_password      AS fc_strong_password
       ,fc.double_field         AS fc_double_field
       ,fc.with_seconds         AS fc_with_seconds
       ,fc.show_counter         AS fc_show_counter
       ,fc.inline               AS fc_inline
       ,fc.rows_qty             AS fc_rows_qty
       ,fc.min_date             AS fc_min_date
       ,fc.max_date             AS fc_max_date
       ,fc.options_json         AS fc_options_json
       ,fc.datalist_json        AS fc_datalist_json
       ,fc.allowed_domains_json AS fc_allowed_domains_json
       ,fc.select_config_json   AS fc_select_config_json
       ,fc.style_json           AS fc_style_json
       ,fc.attributes_json      AS fc_attributes_json
       ,fm.created_at           AS created_at
       ,fm.updated_at           AS updated_at
       ,fm.deleted_at           AS deleted_at
FROM `form_manager` fm
LEFT JOIN `form_groups` fg
ON fg.form_manager_id = fm.id AND fg.deleted_at IS NULL
LEFT JOIN `form_rows` fr
ON fr.form_group_id = fg.id AND fr.deleted_at IS NULL
LEFT JOIN `form_fields` fc
ON fc.form_row_id = fr.id AND fc.deleted_at IS NULL
WHERE fm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_manager
-- timeline_manager (tm) + user_manager (um) + user_profiles (uc), junção à
-- esquerda. Sem filtro de exclusão na tabela principal, para as rotas de
-- leitura que incluem excluídos continuarem vendo os registros apagados.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_manager`;
CREATE VIEW `view_timeline_manager` AS
SELECT  tm.id              AS id
       ,tm.user_manager_id AS tm_user_manager_id
       ,tm.slug            AS tm_slug
       ,tm.title           AS tm_title
       ,tm.description     AS tm_description
       ,tm.cover_image_url AS tm_cover_image_url
       ,tm.status          AS tm_status
       ,tm.version         AS tm_version
       ,um.id              AS um_id
       ,um.username        AS um_username
       ,um.status          AS um_status
       ,uc.id              AS uc_id
       ,uc.uuid            AS uc_uuid
       ,uc.name            AS uc_name
       ,uc.email           AS uc_email
       ,tm.created_at      AS created_at
       ,tm.updated_at      AS updated_at
       ,tm.deleted_at      AS deleted_at
FROM `timeline_manager` tm
LEFT JOIN `user_manager` um
ON um.id = tm.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_post_attachments
-- timeline_post_attachments (ta) + timeline_posts (tp) e o autor do post
-- (um, uc), junção à esquerda. Uma linha por anexo. Sem filtro de exclusão na
-- tabela principal.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_attachments`;
CREATE VIEW `view_timeline_post_attachments` AS
SELECT  ta.id                  AS id
       ,ta.timeline_post_id    AS ta_timeline_post_id
       ,ta.file_key            AS ta_file_key
       ,ta.original_name       AS ta_original_name
       ,ta.stored_name         AS ta_stored_name
       ,ta.storage_path        AS ta_storage_path
       ,ta.file_url            AS ta_file_url
       ,ta.mime_type           AS ta_mime_type
       ,ta.extension           AS ta_extension
       ,ta.file_size           AS ta_file_size
       ,ta.checksum_sha256     AS ta_checksum_sha256
       ,ta.category            AS ta_category
       ,ta.title               AS ta_title
       ,ta.description         AS ta_description
       ,ta.sort_order          AS ta_sort_order
       ,ta.status              AS ta_status
       ,tp.id                  AS tp_id
       ,tp.timeline_manager_id AS tp_timeline_manager_id
       ,tp.user_manager_id     AS tp_user_manager_id
       ,tp.title               AS tp_title
       ,tp.status              AS tp_status
       ,tp.published_at        AS tp_published_at
       ,um.username            AS um_username
       ,uc.name                AS uc_name
       ,ta.created_at          AS created_at
       ,ta.updated_at          AS updated_at
       ,ta.deleted_at          AS deleted_at
FROM `timeline_post_attachments` ta
LEFT JOIN `timeline_posts` tp
ON tp.id = ta.timeline_post_id AND tp.deleted_at IS NULL
LEFT JOIN `user_manager` um
ON um.id = tp.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_post_comments
-- timeline_post_comments (tc) + autor (um, uc), post (tp) e comentário pai
-- (pc), junção à esquerda. Uma linha por comentário. Sem filtro de exclusão na
-- tabela principal.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_comments`;
CREATE VIEW `view_timeline_post_comments` AS
SELECT  tc.id               AS id
       ,tc.timeline_post_id AS tc_timeline_post_id
       ,tc.user_manager_id  AS tc_user_manager_id
       ,tc.parent_id        AS tc_parent_id
       ,tc.content          AS tc_content
       ,tc.status           AS tc_status
       ,tc.edited_at        AS tc_edited_at
       ,um.username         AS um_username
       ,uc.name             AS uc_name
       ,tp.id               AS tp_id
       ,tp.title            AS tp_title
       ,tp.status           AS tp_status
       ,pc.id               AS pc_id
       ,pc.content          AS pc_content
       ,tc.created_at       AS created_at
       ,tc.updated_at       AS updated_at
       ,tc.deleted_at       AS deleted_at
FROM `timeline_post_comments` tc
LEFT JOIN `user_manager` um
ON um.id = tc.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `timeline_posts` tp
ON tp.id = tc.timeline_post_id AND tp.deleted_at IS NULL
LEFT JOIN `timeline_post_comments` pc
ON pc.id = tc.parent_id AND pc.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_post_ratings
-- timeline_post_ratings (rt) + autor (um, uc) e post (tp), junção à esquerda.
-- Uma linha por avaliação. Sem filtro de exclusão na tabela principal.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_ratings`;
CREATE VIEW `view_timeline_post_ratings` AS
SELECT  rt.id               AS id
       ,rt.timeline_post_id AS rt_timeline_post_id
       ,rt.user_manager_id  AS rt_user_manager_id
       ,rt.rating           AS rt_rating
       ,um.username         AS um_username
       ,uc.name             AS uc_name
       ,tp.id               AS tp_id
       ,tp.title            AS tp_title
       ,tp.status           AS tp_status
       ,rt.created_at       AS created_at
       ,rt.updated_at       AS updated_at
       ,rt.deleted_at       AS deleted_at
FROM `timeline_post_ratings` rt
LEFT JOIN `user_manager` um
ON um.id = rt.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `timeline_posts` tp
ON tp.id = rt.timeline_post_id AND tp.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_post_reactions
-- timeline_post_reactions (tr) + autor (um, uc) e post (tp), junção à
-- esquerda. Uma linha por reação. Sem filtro de exclusão na tabela principal.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_reactions`;
CREATE VIEW `view_timeline_post_reactions` AS
SELECT  tr.id               AS id
       ,tr.timeline_post_id AS tr_timeline_post_id
       ,tr.user_manager_id  AS tr_user_manager_id
       ,tr.reaction_type    AS tr_reaction_type
       ,um.username         AS um_username
       ,uc.name             AS uc_name
       ,tp.id               AS tp_id
       ,tp.title            AS tp_title
       ,tp.status           AS tp_status
       ,tr.created_at       AS created_at
       ,tr.updated_at       AS updated_at
       ,tr.deleted_at       AS deleted_at
FROM `timeline_post_reactions` tr
LEFT JOIN `user_manager` um
ON um.id = tr.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `timeline_posts` tp
ON tp.id = tr.timeline_post_id AND tp.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_post_reports
-- timeline_post_reports (trp) + denunciante (um, uc), moderador (mu, muc) e
-- post (tp), junção à esquerda. Uma linha por denúncia. Sem filtro de exclusão
-- na tabela principal.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_reports`;
CREATE VIEW `view_timeline_post_reports` AS
SELECT  trp.id               AS id
       ,trp.timeline_post_id AS trp_timeline_post_id
       ,trp.user_manager_id  AS trp_user_manager_id
       ,trp.reason           AS trp_reason
       ,trp.description      AS trp_description
       ,trp.status           AS trp_status
       ,trp.reviewed_by      AS trp_reviewed_by
       ,trp.reviewed_at      AS trp_reviewed_at
       ,trp.review_note      AS trp_review_note
       ,um.username          AS um_username
       ,uc.name              AS uc_name
       ,mu.username          AS mu_username
       ,muc.name             AS muc_name
       ,tp.id                AS tp_id
       ,tp.title             AS tp_title
       ,tp.status            AS tp_status
       ,trp.created_at       AS created_at
       ,trp.updated_at       AS updated_at
       ,trp.deleted_at       AS deleted_at
FROM `timeline_post_reports` trp
LEFT JOIN `user_manager` um
ON um.id = trp.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `user_manager` mu
ON mu.id = trp.reviewed_by AND mu.deleted_at IS NULL
LEFT JOIN `user_profiles` muc
ON muc.user_manager_id = mu.id AND muc.deleted_at IS NULL
LEFT JOIN `timeline_posts` tp
ON tp.id = trp.timeline_post_id AND tp.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_posts
-- Feed: timeline_posts (tp) + timeline dona (tm), autor (um, uc) e post
-- original quando for republicação (rp, ru, rc), mais os contadores por
-- subconsulta escalar. Uma linha por post. Diferente das views de apoio, aqui
-- há filtro de exclusão na própria tabela principal. O id exposto é o do post
-- (tp).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_posts`;
CREATE VIEW `view_timeline_posts` AS
SELECT  tp.id                  AS id
       ,tp.timeline_manager_id AS tp_timeline_manager_id
       ,tp.user_manager_id     AS tp_user_manager_id
       ,tp.repost_of_id        AS tp_repost_of_id
       ,tp.title               AS tp_title
       ,tp.content             AS tp_content
       ,tp.status              AS tp_status
       ,tp.published_at        AS tp_published_at
       ,tp.edited_at           AS tp_edited_at
       ,tm.id                  AS tm_id
       ,tm.user_manager_id     AS tm_user_manager_id
       ,tm.slug                AS tm_slug
       ,tm.title               AS tm_title
       ,tm.cover_image_url     AS tm_cover_image_url
       ,tm.status              AS tm_status
       ,um.id                  AS um_id
       ,um.username            AS um_username
       ,um.status              AS um_status
       ,uc.id                  AS uc_id
       ,uc.uuid                AS uc_uuid
       ,uc.name                AS uc_name
       ,uc.email               AS uc_email
       ,rp.id                  AS rp_id
       ,rp.user_manager_id     AS rp_user_manager_id
       ,rp.content             AS rp_content
       ,rp.published_at        AS rp_published_at
       ,ru.username            AS ru_username
       ,rc.name                AS rc_name
       ,(SELECT COUNT(*) FROM `timeline_post_comments` c WHERE c.timeline_post_id = tp.id AND c.deleted_at IS NULL AND c.status = 'published') AS comments_count
       ,(SELECT COUNT(*) FROM `timeline_post_reactions` lr WHERE lr.timeline_post_id = tp.id AND lr.deleted_at IS NULL AND lr.reaction_type = 'LIKE') AS likes_count
       ,(SELECT COUNT(*) FROM `timeline_post_reactions` dr WHERE dr.timeline_post_id = tp.id AND dr.deleted_at IS NULL AND dr.reaction_type = 'dislike') AS dislikes_count
       ,(SELECT COUNT(*) FROM `timeline_post_ratings` rt WHERE rt.timeline_post_id = tp.id AND rt.deleted_at IS NULL) AS ratings_count
       ,(SELECT ROUND(AVG(`rt2`.`rating`),2) FROM `timeline_post_ratings` rt2 WHERE rt2.timeline_post_id = tp.id AND rt2.deleted_at IS NULL) AS ratings_avg
       ,(SELECT COUNT(*) FROM `timeline_posts` rp2 WHERE rp2.repost_of_id = tp.id AND rp2.deleted_at IS NULL) AS reposts_count
       ,(SELECT COUNT(*) FROM `timeline_post_attachments` at WHERE at.timeline_post_id = tp.id AND at.deleted_at IS NULL AND at.status = 'active') AS attachments_count
       ,tp.created_at          AS created_at
       ,tp.updated_at          AS updated_at
       ,tp.deleted_at          AS deleted_at
FROM `timeline_posts` tp
JOIN `timeline_manager` tm
ON tm.id = tp.timeline_manager_id AND tm.deleted_at IS NULL
JOIN `user_manager` um
ON um.id = tp.user_manager_id AND um.deleted_at IS NULL
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `timeline_posts` rp
ON rp.id = tp.repost_of_id AND rp.deleted_at IS NULL
LEFT JOIN `user_manager` ru
ON ru.id = rp.user_manager_id AND ru.deleted_at IS NULL
LEFT JOIN `user_profiles` rc
ON rc.user_manager_id = ru.id AND rc.deleted_at IS NULL
WHERE tp.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_upload_manager
-- Projeção direta de uploads (u), sem junção — colunas prefixadas up_.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_upload_manager`;
CREATE VIEW `view_upload_manager` AS
SELECT  u.id            AS id
       ,u.module        AS up_module
       ,u.reference_id  AS up_reference_id
       ,u.collection    AS up_collection
       ,u.file_key      AS up_file_key
       ,u.original_name AS up_original_name
       ,u.stored_name   AS up_stored_name
       ,u.storage_path  AS up_storage_path
       ,u.file_url      AS up_file_url
       ,u.mime_type     AS up_mime_type
       ,u.extension     AS up_extension
       ,u.file_size     AS up_file_size
       ,u.category      AS up_category
       ,u.title         AS up_title
       ,u.description   AS up_description
       ,u.status        AS up_status
       ,u.created_at    AS created_at
       ,u.updated_at    AS updated_at
       ,u.deleted_at    AS deleted_at
FROM `uploads` u;
-- -----------------------------------------------------------------------------
-- view_user_directory
-- user_manager (um) + user_profiles (uc), junção à esquerda — diretório mínimo
-- de usuários (identificação e contato), consumido pelo campo de escolha de
-- convidado do calendário. Usuário sem perfil ainda aparece, com uc_name e
-- uc_email vazios.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_directory`;
CREATE VIEW `view_user_directory` AS
SELECT  um.id       AS id
       ,um.username AS um_username
       ,uc.name     AS uc_name
       ,uc.email    AS uc_email
FROM `user_manager` um
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
WHERE um.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_user_manager
-- user_manager (um) + user_profiles (uc) + user_roles (ur), junção à esquerda.
-- Usuário sem perfil ou sem perfil de acesso ainda aparece, com as colunas uc_*
-- e ur_* vazias.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_manager`;
CREATE VIEW `view_user_manager` AS
SELECT  um.id            AS id
       ,um.username      AS um_username
       ,um.status        AS um_status
       ,um.user_role_id  AS um_user_role_id
       ,um.last_login_at AS um_last_login_at
       ,uc.id            AS uc_id
       ,uc.uuid          AS uc_uuid
       ,uc.name          AS uc_name
       ,uc.email         AS uc_email
       ,uc.phone         AS uc_phone
       ,uc.whatsapp      AS uc_whatsapp
       ,uc.cpf           AS uc_cpf
       ,uc.cep           AS uc_cep
       ,uc.address       AS uc_address
       ,ur.slug          AS ur_role_slug
       ,ur.name          AS ur_role_name
       ,ur.id            AS ur_role_id
       ,ur.description   AS ur_role_description
       ,um.created_at    AS created_at
       ,um.updated_at    AS updated_at
       ,um.deleted_at    AS deleted_at
FROM `user_manager` um
LEFT JOIN `user_profiles` uc
ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
LEFT JOIN `user_roles` ur
ON ur.id = um.user_role_id AND ur.deleted_at IS NULL;
