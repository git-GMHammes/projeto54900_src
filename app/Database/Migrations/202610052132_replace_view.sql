-- -----------------------------------------------------------------------------
-- Views do banco codeigniter54900_db — dump formatado em 2026-10-05.
-- Fonte: estrutura real das tabelas (colunas e chaves estrangeiras), conferida em 2026-10-05.
-- Ordem: view_aux_cor, view_bootstrap_icons, view_calendar_event_attachments, view_calendar_event_attendees, view_calendar_event_extended_properties, view_calendar_event_invites, view_calendar_event_reminders, view_calendar_manager, view_chat_message_edits, view_chat_message_mentions, view_chat_messages, view_chat_room_attachment_reports, view_chat_room_attachments, view_chat_room_favorites, view_chat_room_members, view_chat_room_warnings, view_chat_rooms_manager, view_form_manager, view_list_actions, view_list_columns, view_list_manager, view_menu_manager, view_nav_manager, view_route_manager, view_timeline_manager, view_timeline_post_attachments, view_timeline_post_comments, view_timeline_post_ratings, view_timeline_post_reactions, view_timeline_post_reports, view_timeline_posts, view_upload_manager, view_user_directory, view_user_manager, view_messages_manager, view_messages_users, view_message_groups_manager, view_message_group_members, view_message_group_messages.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
-- -----------------------------------------------------------------------------
-- view_calendar_manager
-- Base: calendar_manager (cm), com junção à esquerda de calendar_events
-- (ce).
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
       cm.sort_order AS cm_sort_order,
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
       ce.user_manager_id AS ce_user_manager_id,
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       cm.created_at AS created_at,
       cm.updated_at AS updated_at,
       cm.deleted_at AS deleted_at
FROM calendar_manager cm
       LEFT JOIN calendar_events ce ON (
              ce.calendar_id = cm.id
              AND ce.deleted_at IS NULL
       )
WHERE cm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_chat_messages
-- Base: chat_messages (cm), com junção à esquerda de chat_rooms_manager
-- (cr), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_messages`;
CREATE VIEW `view_chat_messages` AS
SELECT cm.id AS id,
       cm.chat_rooms_manager_id AS cm_chat_rooms_manager_id,
       cm.user_manager_id AS cm_user_manager_id,
       cm.content AS cm_content,
       cm.status AS cm_status,
       cr.id AS cr_id,
       cr.name AS cr_name,
       cr.status AS cr_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
(
              SELECT COUNT(*)
              FROM chat_room_attachments a
              WHERE (
                            a.chat_message_id = cm.id
                            AND a.deleted_at IS NULL
                            AND (a.status = 'active')
                     )
       ) AS attachments_count,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       cr.created_at AS cr_created_at,
       cr.updated_at AS cr_updated_at,
       cr.deleted_at AS cr_deleted_at,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cm.created_at AS created_at,
       cm.updated_at AS updated_at,
       cm.deleted_at AS deleted_at
FROM chat_messages cm
       LEFT JOIN chat_rooms_manager cr ON (
              cr.id = cm.chat_rooms_manager_id
              AND cr.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = cm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_attachment_reports
-- Base: chat_room_attachment_reports (crar), com junção à esquerda de
-- chat_room_attachments (cra), user_manager (um), user_profiles (uc),
-- user_manager (mu), user_profiles (muc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_room_attachment_reports`;
CREATE VIEW `view_chat_room_attachment_reports` AS
SELECT crar.id AS id,
       crar.chat_room_attachment_id AS crar_chat_room_attachment_id,
       crar.reporter_user_manager_id AS crar_reporter_user_manager_id,
       crar.reason AS crar_reason,
       crar.description AS crar_description,
       crar.status AS crar_status,
       crar.reviewed_by AS crar_reviewed_by,
       crar.reviewed_at AS crar_reviewed_at,
       crar.review_note AS crar_review_note,
       cra.id AS cra_id,
       cra.original_name AS cra_original_name,
       cra.file_url AS cra_file_url,
       um.id AS um_id,
       um.username AS um_username,
       uc.id AS uc_id,
       uc.name AS uc_name,
       mu.id AS mu_id,
       mu.username AS mu_username,
       muc.id AS muc_id,
       muc.name AS muc_name,
       cra.chat_message_id AS cra_chat_message_id,
       cra.file_key AS cra_file_key,
       cra.stored_name AS cra_stored_name,
       cra.storage_path AS cra_storage_path,
       cra.mime_type AS cra_mime_type,
       cra.extension AS cra_extension,
       cra.file_size AS cra_file_size,
       cra.checksum_sha256 AS cra_checksum_sha256,
       cra.category AS cra_category,
       cra.status AS cra_status,
       cra.created_at AS cra_created_at,
       cra.updated_at AS cra_updated_at,
       cra.deleted_at AS cra_deleted_at,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       mu.status AS mu_status,
       mu.user_role_id AS mu_user_role_id,
       mu.last_login_at AS mu_last_login_at,
       mu.created_at AS mu_created_at,
       mu.updated_at AS mu_updated_at,
       mu.deleted_at AS mu_deleted_at,
       muc.user_manager_id AS muc_user_manager_id,
       muc.uuid AS muc_uuid,
       muc.phone AS muc_phone,
       muc.whatsapp AS muc_whatsapp,
       muc.email AS muc_email,
       muc.cpf AS muc_cpf,
       muc.cep AS muc_cep,
       muc.address AS muc_address,
       muc.created_at AS muc_created_at,
       muc.updated_at AS muc_updated_at,
       muc.deleted_at AS muc_deleted_at,
       crar.created_at AS created_at,
       crar.updated_at AS updated_at,
       crar.deleted_at AS deleted_at
FROM chat_room_attachment_reports crar
       LEFT JOIN chat_room_attachments cra ON (
              cra.id = crar.chat_room_attachment_id
              AND cra.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = crar.reporter_user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN user_manager mu ON (
              mu.id = crar.reviewed_by
              AND mu.deleted_at IS NULL
       )
       LEFT JOIN user_profiles muc ON (
              muc.user_manager_id = mu.id
              AND muc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_attachments
-- Base: chat_room_attachments (cra), com junção à esquerda de
-- chat_messages (cm), chat_rooms_manager (cr), user_manager (um),
-- user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_room_attachments`;
CREATE VIEW `view_chat_room_attachments` AS
SELECT cra.id AS id,
       cra.chat_message_id AS cra_chat_message_id,
       cra.file_key AS cra_file_key,
       cra.original_name AS cra_original_name,
       cra.stored_name AS cra_stored_name,
       cra.storage_path AS cra_storage_path,
       cra.file_url AS cra_file_url,
       cra.mime_type AS cra_mime_type,
       cra.extension AS cra_extension,
       cra.file_size AS cra_file_size,
       cra.checksum_sha256 AS cra_checksum_sha256,
       cra.category AS cra_category,
       cra.status AS cra_status,
       cm.id AS cm_id,
       cm.chat_rooms_manager_id AS cm_chat_rooms_manager_id,
       cm.user_manager_id AS cm_user_manager_id,
       cr.id AS cr_id,
       cr.name AS cr_name,
       um.id AS um_id,
       um.username AS um_username,
       uc.id AS uc_id,
       uc.name AS uc_name,
       cm.content AS cm_content,
       cm.status AS cm_status,
       cm.created_at AS cm_created_at,
       cm.updated_at AS cm_updated_at,
       cm.deleted_at AS cm_deleted_at,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.status AS cr_status,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       cr.created_at AS cr_created_at,
       cr.updated_at AS cr_updated_at,
       cr.deleted_at AS cr_deleted_at,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cra.created_at AS created_at,
       cra.updated_at AS updated_at,
       cra.deleted_at AS deleted_at
FROM chat_room_attachments cra
       LEFT JOIN chat_messages cm ON (
              cm.id = cra.chat_message_id
              AND cm.deleted_at IS NULL
       )
       LEFT JOIN chat_rooms_manager cr ON (
              cr.id = cm.chat_rooms_manager_id
              AND cr.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = cm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_favorites
-- Base: chat_room_favorites (crf), com junção à esquerda de
-- chat_rooms_manager (cr), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_room_favorites`;
CREATE VIEW `view_chat_room_favorites` AS
SELECT crf.id AS id,
       crf.chat_rooms_manager_id AS crf_chat_rooms_manager_id,
       crf.user_manager_id AS crf_user_manager_id,
       cr.id AS cr_id,
       cr.name AS cr_name,
       cr.status AS cr_status,
       um.id AS um_id,
       um.username AS um_username,
       uc.id AS uc_id,
       uc.name AS uc_name,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       cr.created_at AS cr_created_at,
       cr.updated_at AS cr_updated_at,
       cr.deleted_at AS cr_deleted_at,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       crf.created_at AS created_at,
       crf.updated_at AS updated_at,
       crf.deleted_at AS deleted_at
FROM chat_room_favorites crf
       LEFT JOIN chat_rooms_manager cr ON (
              cr.id = crf.chat_rooms_manager_id
              AND cr.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = crf.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_members
-- Base: chat_room_members (crm), com junção à esquerda de
-- chat_rooms_manager (cr), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_room_members`;
CREATE VIEW `view_chat_room_members` AS
SELECT crm.id AS id,
       crm.chat_rooms_manager_id AS crm_chat_rooms_manager_id,
       crm.user_manager_id AS crm_user_manager_id,
       crm.role AS crm_role,
       crm.status AS crm_status,
       crm.blocked_reason AS crm_blocked_reason,
       crm.blocked_at AS crm_blocked_at,
       cr.id AS cr_id,
       cr.name AS cr_name,
       cr.status AS cr_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       cr.created_at AS cr_created_at,
       cr.updated_at AS cr_updated_at,
       cr.deleted_at AS cr_deleted_at,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       crm.created_at AS created_at,
       crm.updated_at AS updated_at,
       crm.deleted_at AS deleted_at
FROM chat_room_members crm
       LEFT JOIN chat_rooms_manager cr ON (
              cr.id = crm.chat_rooms_manager_id
              AND cr.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = crm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_warnings
-- Base: chat_room_warnings (crw), com junção à esquerda de
-- chat_rooms_manager (cr), user_manager (um), user_profiles (uc),
-- chat_messages (cm).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_room_warnings`;
CREATE VIEW `view_chat_room_warnings` AS
SELECT crw.id AS id,
       crw.chat_rooms_manager_id AS crw_chat_rooms_manager_id,
       crw.user_manager_id AS crw_user_manager_id,
       crw.chat_message_id AS crw_chat_message_id,
       crw.flagged_word AS crw_flagged_word,
       cr.id AS cr_id,
       cr.name AS cr_name,
       um.id AS um_id,
       um.username AS um_username,
       uc.id AS uc_id,
       uc.name AS uc_name,
       cm.id AS cm_id,
       cm.content AS cm_content,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.status AS cr_status,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       cr.created_at AS cr_created_at,
       cr.updated_at AS cr_updated_at,
       cr.deleted_at AS cr_deleted_at,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cm.chat_rooms_manager_id AS cm_chat_rooms_manager_id,
       cm.user_manager_id AS cm_user_manager_id,
       cm.status AS cm_status,
       cm.created_at AS cm_created_at,
       cm.updated_at AS cm_updated_at,
       cm.deleted_at AS cm_deleted_at,
       crw.created_at AS created_at,
       crw.updated_at AS updated_at,
       crw.deleted_at AS deleted_at
FROM chat_room_warnings crw
       LEFT JOIN chat_rooms_manager cr ON (
              cr.id = crw.chat_rooms_manager_id
              AND cr.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = crw.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN chat_messages cm ON (
              cm.id = crw.chat_message_id
              AND cm.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_rooms_manager
-- Base: chat_rooms_manager (cr), com junção à esquerda de user_manager
-- (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_rooms_manager`;
CREATE VIEW `view_chat_rooms_manager` AS
SELECT cr.id AS id,
       cr.owner_user_manager_id AS cr_owner_user_manager_id,
       cr.name AS cr_name,
       cr.description AS cr_description,
       cr.moderation_accepted AS cr_moderation_accepted,
       cr.moderation_accepted_at AS cr_moderation_accepted_at,
       cr.status AS cr_status,
       cr.closed_at AS cr_closed_at,
       cr.closed_reason AS cr_closed_reason,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
(
              SELECT COUNT(*)
              FROM chat_room_members m
              WHERE (
                            m.chat_rooms_manager_id = cr.id
                            AND m.deleted_at IS NULL
                            AND (m.status = 'active')
                     )
       ) AS members_count,
(
              SELECT COUNT(*)
              FROM chat_room_members bm
              WHERE (
                            bm.chat_rooms_manager_id = cr.id
                            AND bm.deleted_at IS NULL
                            AND (bm.status = 'blocked')
                     )
       ) AS blocked_members_count,
(
              SELECT COUNT(*)
              FROM chat_messages msg
              WHERE (
                            msg.chat_rooms_manager_id = cr.id
                            AND msg.deleted_at IS NULL
                            AND (msg.status = 'sent')
                     )
       ) AS messages_count,
(
              SELECT COUNT(*)
              FROM chat_room_favorites f
              WHERE f.chat_rooms_manager_id = cr.id
                     AND f.deleted_at IS NULL
       ) AS favorites_count,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cr.created_at AS created_at,
       cr.updated_at AS updated_at,
       cr.deleted_at AS deleted_at
FROM chat_rooms_manager cr
       LEFT JOIN user_manager um ON (
              um.id = cr.owner_user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_form_manager
-- Base: form_manager (fm), com junção à esquerda de form_groups (fg),
-- form_rows (fr), form_fields (fc).
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
       fg.form_manager_id AS fg_form_manager_id,
       fg.created_at AS fg_created_at,
       fg.updated_at AS fg_updated_at,
       fg.deleted_at AS fg_deleted_at,
       fr.form_group_id AS fr_form_group_id,
       fr.created_at AS fr_created_at,
       fr.updated_at AS fr_updated_at,
       fr.deleted_at AS fr_deleted_at,
       fc.form_row_id AS fc_form_row_id,
       fc.equal_fields AS fc_equal_fields,
       fc.created_at AS fc_created_at,
       fc.updated_at AS fc_updated_at,
       fc.deleted_at AS fc_deleted_at,
       fm.created_at AS created_at,
       fm.updated_at AS updated_at,
       fm.deleted_at AS deleted_at
FROM form_manager fm
       LEFT JOIN form_groups fg ON (
              fg.form_manager_id = fm.id
              AND fg.deleted_at IS NULL
       )
       LEFT JOIN form_rows fr ON (
              fr.form_group_id = fg.id
              AND fr.deleted_at IS NULL
       )
       LEFT JOIN form_fields fc ON (
              fc.form_row_id = fr.id
              AND fc.deleted_at IS NULL
       )
WHERE fm.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_timeline_manager
-- Base: timeline_manager (tm), com junção à esquerda de user_manager
-- (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_manager`;
CREATE VIEW `view_timeline_manager` AS
SELECT tm.id AS id,
       tm.user_manager_id AS tm_user_manager_id,
       tm.slug AS tm_slug,
       tm.title AS tm_title,
       tm.description AS tm_description,
       tm.cover_image_url AS tm_cover_image_url,
       tm.status AS tm_status,
       tm.version AS tm_version,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       tm.created_at AS created_at,
       tm.updated_at AS updated_at,
       tm.deleted_at AS deleted_at
FROM timeline_manager tm
       LEFT JOIN user_manager um ON (
              um.id = tm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_attachments
-- Base: timeline_post_attachments (ta), com junção à esquerda de
-- timeline_posts (tp), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_attachments`;
CREATE VIEW `view_timeline_post_attachments` AS
SELECT ta.id AS id,
       ta.timeline_post_id AS ta_timeline_post_id,
       ta.file_key AS ta_file_key,
       ta.original_name AS ta_original_name,
       ta.stored_name AS ta_stored_name,
       ta.storage_path AS ta_storage_path,
       ta.file_url AS ta_file_url,
       ta.mime_type AS ta_mime_type,
       ta.extension AS ta_extension,
       ta.file_size AS ta_file_size,
       ta.checksum_sha256 AS ta_checksum_sha256,
       ta.category AS ta_category,
       ta.title AS ta_title,
       ta.description AS ta_description,
       ta.sort_order AS ta_sort_order,
       ta.status AS ta_status,
       tp.id AS tp_id,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.title AS tp_title,
       tp.status AS tp_status,
       tp.published_at AS tp_published_at,
       um.username AS um_username,
       uc.name AS uc_name,
       tp.repost_of_id AS tp_repost_of_id,
       tp.content AS tp_content,
       tp.edited_at AS tp_edited_at,
       tp.created_at AS tp_created_at,
       tp.updated_at AS tp_updated_at,
       tp.deleted_at AS tp_deleted_at,
       um.id AS um_id,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       ta.created_at AS created_at,
       ta.updated_at AS updated_at,
       ta.deleted_at AS deleted_at
FROM timeline_post_attachments ta
       LEFT JOIN timeline_posts tp ON (
              tp.id = ta.timeline_post_id
              AND tp.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = tp.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_comments
-- Base: timeline_post_comments (tc), com junção à esquerda de
-- user_manager (um), user_profiles (uc), timeline_posts (tp),
-- timeline_post_comments (pc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_comments`;
CREATE VIEW `view_timeline_post_comments` AS
SELECT tc.id AS id,
       tc.timeline_post_id AS tc_timeline_post_id,
       tc.user_manager_id AS tc_user_manager_id,
       tc.parent_id AS tc_parent_id,
       tc.content AS tc_content,
       tc.status AS tc_status,
       tc.edited_at AS tc_edited_at,
       um.username AS um_username,
       uc.name AS uc_name,
       tp.id AS tp_id,
       tp.title AS tp_title,
       tp.status AS tp_status,
       pc.id AS pc_id,
       pc.content AS pc_content,
       um.id AS um_id,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.repost_of_id AS tp_repost_of_id,
       tp.content AS tp_content,
       tp.published_at AS tp_published_at,
       tp.edited_at AS tp_edited_at,
       tp.created_at AS tp_created_at,
       tp.updated_at AS tp_updated_at,
       tp.deleted_at AS tp_deleted_at,
       pc.timeline_post_id AS pc_timeline_post_id,
       pc.user_manager_id AS pc_user_manager_id,
       pc.parent_id AS pc_parent_id,
       pc.status AS pc_status,
       pc.edited_at AS pc_edited_at,
       pc.created_at AS pc_created_at,
       pc.updated_at AS pc_updated_at,
       pc.deleted_at AS pc_deleted_at,
       tc.created_at AS created_at,
       tc.updated_at AS updated_at,
       tc.deleted_at AS deleted_at
FROM timeline_post_comments tc
       LEFT JOIN user_manager um ON (
              um.id = tc.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN timeline_posts tp ON (
              tp.id = tc.timeline_post_id
              AND tp.deleted_at IS NULL
       )
       LEFT JOIN timeline_post_comments pc ON (
              pc.id = tc.parent_id
              AND pc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_ratings
-- Base: timeline_post_ratings (rt), com junção à esquerda de user_manager
-- (um), user_profiles (uc), timeline_posts (tp).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_ratings`;
CREATE VIEW `view_timeline_post_ratings` AS
SELECT rt.id AS id,
       rt.timeline_post_id AS rt_timeline_post_id,
       rt.user_manager_id AS rt_user_manager_id,
       rt.rating AS rt_rating,
       um.username AS um_username,
       uc.name AS uc_name,
       tp.id AS tp_id,
       tp.title AS tp_title,
       tp.status AS tp_status,
       um.id AS um_id,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.repost_of_id AS tp_repost_of_id,
       tp.content AS tp_content,
       tp.published_at AS tp_published_at,
       tp.edited_at AS tp_edited_at,
       tp.created_at AS tp_created_at,
       tp.updated_at AS tp_updated_at,
       tp.deleted_at AS tp_deleted_at,
       rt.created_at AS created_at,
       rt.updated_at AS updated_at,
       rt.deleted_at AS deleted_at
FROM timeline_post_ratings rt
       LEFT JOIN user_manager um ON (
              um.id = rt.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN timeline_posts tp ON (
              tp.id = rt.timeline_post_id
              AND tp.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_reactions
-- Base: timeline_post_reactions (tr), com junção à esquerda de
-- user_manager (um), user_profiles (uc), timeline_posts (tp).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_reactions`;
CREATE VIEW `view_timeline_post_reactions` AS
SELECT tr.id AS id,
       tr.timeline_post_id AS tr_timeline_post_id,
       tr.user_manager_id AS tr_user_manager_id,
       tr.reaction_type AS tr_reaction_type,
       um.username AS um_username,
       uc.name AS uc_name,
       tp.id AS tp_id,
       tp.title AS tp_title,
       tp.status AS tp_status,
       um.id AS um_id,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.repost_of_id AS tp_repost_of_id,
       tp.content AS tp_content,
       tp.published_at AS tp_published_at,
       tp.edited_at AS tp_edited_at,
       tp.created_at AS tp_created_at,
       tp.updated_at AS tp_updated_at,
       tp.deleted_at AS tp_deleted_at,
       tr.created_at AS created_at,
       tr.updated_at AS updated_at,
       tr.deleted_at AS deleted_at
FROM timeline_post_reactions tr
       LEFT JOIN user_manager um ON (
              um.id = tr.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN timeline_posts tp ON (
              tp.id = tr.timeline_post_id
              AND tp.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_reports
-- Base: timeline_post_reports (trp), com junção à esquerda de
-- user_manager (um), user_profiles (uc), user_manager (mu), user_profiles
-- (muc), timeline_posts (tp).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_post_reports`;
CREATE VIEW `view_timeline_post_reports` AS
SELECT trp.id AS id,
       trp.timeline_post_id AS trp_timeline_post_id,
       trp.user_manager_id AS trp_user_manager_id,
       trp.reason AS trp_reason,
       trp.description AS trp_description,
       trp.status AS trp_status,
       trp.reviewed_by AS trp_reviewed_by,
       trp.reviewed_at AS trp_reviewed_at,
       trp.review_note AS trp_review_note,
       um.username AS um_username,
       uc.name AS uc_name,
       mu.username AS mu_username,
       muc.name AS muc_name,
       tp.id AS tp_id,
       tp.title AS tp_title,
       tp.status AS tp_status,
       um.id AS um_id,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       mu.id AS mu_id,
       mu.status AS mu_status,
       mu.user_role_id AS mu_user_role_id,
       mu.last_login_at AS mu_last_login_at,
       mu.created_at AS mu_created_at,
       mu.updated_at AS mu_updated_at,
       mu.deleted_at AS mu_deleted_at,
       muc.id AS muc_id,
       muc.user_manager_id AS muc_user_manager_id,
       muc.uuid AS muc_uuid,
       muc.phone AS muc_phone,
       muc.whatsapp AS muc_whatsapp,
       muc.email AS muc_email,
       muc.cpf AS muc_cpf,
       muc.cep AS muc_cep,
       muc.address AS muc_address,
       muc.created_at AS muc_created_at,
       muc.updated_at AS muc_updated_at,
       muc.deleted_at AS muc_deleted_at,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.repost_of_id AS tp_repost_of_id,
       tp.content AS tp_content,
       tp.published_at AS tp_published_at,
       tp.edited_at AS tp_edited_at,
       tp.created_at AS tp_created_at,
       tp.updated_at AS tp_updated_at,
       tp.deleted_at AS tp_deleted_at,
       trp.created_at AS created_at,
       trp.updated_at AS updated_at,
       trp.deleted_at AS deleted_at
FROM timeline_post_reports trp
       LEFT JOIN user_manager um ON (
              um.id = trp.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN user_manager mu ON (
              mu.id = trp.reviewed_by
              AND mu.deleted_at IS NULL
       )
       LEFT JOIN user_profiles muc ON (
              muc.user_manager_id = mu.id
              AND muc.deleted_at IS NULL
       )
       LEFT JOIN timeline_posts tp ON (
              tp.id = trp.timeline_post_id
              AND tp.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_timeline_posts
-- Base: timeline_posts (tp), com junção interna de timeline_manager (tm),
-- user_manager (um); e junção à esquerda de user_profiles (uc),
-- timeline_posts (rp), user_manager (ru), user_profiles (rc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_timeline_posts`;
CREATE VIEW `view_timeline_posts` AS
SELECT tp.id AS id,
       tp.timeline_manager_id AS tp_timeline_manager_id,
       tp.user_manager_id AS tp_user_manager_id,
       tp.repost_of_id AS tp_repost_of_id,
       tp.title AS tp_title,
       tp.content AS tp_content,
       tp.status AS tp_status,
       tp.published_at AS tp_published_at,
       tp.edited_at AS tp_edited_at,
       tm.id AS tm_id,
       tm.user_manager_id AS tm_user_manager_id,
       tm.slug AS tm_slug,
       tm.title AS tm_title,
       tm.cover_image_url AS tm_cover_image_url,
       tm.status AS tm_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
       rp.id AS rp_id,
       rp.user_manager_id AS rp_user_manager_id,
       rp.content AS rp_content,
       rp.published_at AS rp_published_at,
       ru.username AS ru_username,
       rc.name AS rc_name,
(
              SELECT COUNT(*)
              FROM timeline_post_comments c
              WHERE (
                            c.timeline_post_id = tp.id
                            AND c.deleted_at IS NULL
                            AND (c.status = 'published')
                     )
       ) AS comments_count,
(
              SELECT COUNT(*)
              FROM timeline_post_reactions lr
              WHERE (
                            lr.timeline_post_id = tp.id
                            AND lr.deleted_at IS NULL
                            AND (lr.reaction_type = 'LIKE')
                     )
       ) AS likes_count,
(
              SELECT COUNT(*)
              FROM timeline_post_reactions dr
              WHERE (
                            dr.timeline_post_id = tp.id
                            AND dr.deleted_at IS NULL
                            AND (dr.reaction_type = 'dislike')
                     )
       ) AS dislikes_count,
(
              SELECT COUNT(*)
              FROM timeline_post_ratings rt
              WHERE rt.timeline_post_id = tp.id
                     AND rt.deleted_at IS NULL
       ) AS ratings_count,
(
              SELECT ROUND(AVG(rt2.rating), 2)
              FROM timeline_post_ratings rt2
              WHERE rt2.timeline_post_id = tp.id
                     AND rt2.deleted_at IS NULL
       ) AS ratings_avg,
(
              SELECT COUNT(*)
              FROM timeline_posts rp2
              WHERE rp2.repost_of_id = tp.id
                     AND rp2.deleted_at IS NULL
       ) AS reposts_count,
(
              SELECT COUNT(*)
              FROM timeline_post_attachments at
              WHERE (
                            at.timeline_post_id = tp.id
                            AND at.deleted_at IS NULL
                            AND (at.status = 'active')
                     )
       ) AS attachments_count,
       tm.description AS tm_description,
       tm.version AS tm_version,
       tm.created_at AS tm_created_at,
       tm.updated_at AS tm_updated_at,
       tm.deleted_at AS tm_deleted_at,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       rp.timeline_manager_id AS rp_timeline_manager_id,
       rp.repost_of_id AS rp_repost_of_id,
       rp.title AS rp_title,
       rp.status AS rp_status,
       rp.edited_at AS rp_edited_at,
       rp.created_at AS rp_created_at,
       rp.updated_at AS rp_updated_at,
       rp.deleted_at AS rp_deleted_at,
       ru.id AS ru_id,
       ru.status AS ru_status,
       ru.user_role_id AS ru_user_role_id,
       ru.last_login_at AS ru_last_login_at,
       ru.created_at AS ru_created_at,
       ru.updated_at AS ru_updated_at,
       ru.deleted_at AS ru_deleted_at,
       rc.id AS rc_id,
       rc.user_manager_id AS rc_user_manager_id,
       rc.uuid AS rc_uuid,
       rc.phone AS rc_phone,
       rc.whatsapp AS rc_whatsapp,
       rc.email AS rc_email,
       rc.cpf AS rc_cpf,
       rc.cep AS rc_cep,
       rc.address AS rc_address,
       rc.created_at AS rc_created_at,
       rc.updated_at AS rc_updated_at,
       rc.deleted_at AS rc_deleted_at,
       tp.created_at AS created_at,
       tp.updated_at AS updated_at,
       tp.deleted_at AS deleted_at
FROM timeline_posts tp
       JOIN timeline_manager tm ON (
              tm.id = tp.timeline_manager_id
              AND tm.deleted_at IS NULL
       )
       JOIN user_manager um ON (
              um.id = tp.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN timeline_posts rp ON (
              rp.id = tp.repost_of_id
              AND rp.deleted_at IS NULL
       )
       LEFT JOIN user_manager ru ON (
              ru.id = rp.user_manager_id
              AND ru.deleted_at IS NULL
       )
       LEFT JOIN user_profiles rc ON (
              rc.user_manager_id = ru.id
              AND rc.deleted_at IS NULL
       )
WHERE tp.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_upload_manager
-- Base: uploads (u), sem junção.
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
       u.module AS u_module,
       u.reference_id AS u_reference_id,
       u.collection AS u_collection,
       u.file_key AS u_file_key,
       u.original_name AS u_original_name,
       u.stored_name AS u_stored_name,
       u.storage_path AS u_storage_path,
       u.file_url AS u_file_url,
       u.mime_type AS u_mime_type,
       u.extension AS u_extension,
       u.file_size AS u_file_size,
       u.checksum_sha256 AS u_checksum_sha256,
       u.category AS u_category,
       u.title AS u_title,
       u.description AS u_description,
       u.status AS u_status,
       u.created_at AS created_at,
       u.updated_at AS updated_at,
       u.deleted_at AS deleted_at
FROM uploads u;
-- -----------------------------------------------------------------------------
-- view_user_directory
-- Base: user_manager (um), com junção à esquerda de user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_directory`;
CREATE VIEW `view_user_directory` AS
SELECT um.id AS id,
       um.username AS um_username,
       uc.name AS uc_name,
       uc.email AS uc_email,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS created_at,
       um.updated_at AS updated_at,
       um.deleted_at AS deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at
FROM user_manager um
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
WHERE um.deleted_at IS NULL;
-- -----------------------------------------------------------------------------
-- view_user_manager
-- Base: user_manager (um), com junção à esquerda de user_profiles (uc),
-- user_roles (ur).
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
       ur.id AS ur_role_id,
       ur.description AS ur_role_description,
       uc.user_manager_id AS uc_user_manager_id,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       ur.id AS ur_id,
       ur.name AS ur_name,
       ur.slug AS ur_slug,
       ur.description AS ur_description,
       ur.status AS ur_status,
       ur.created_at AS ur_created_at,
       ur.updated_at AS ur_updated_at,
       ur.deleted_at AS ur_deleted_at,
       um.created_at AS created_at,
       um.updated_at AS updated_at,
       um.deleted_at AS deleted_at
FROM user_manager um
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN user_roles ur ON (
              ur.id = um.user_role_id
              AND ur.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_aux_cor
-- Base: aux_cor (ac), sem junção.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_aux_cor`;
CREATE VIEW `view_aux_cor` AS
SELECT ac.id AS id,
       ac.name AS ac_name,
       ac.hexadecimal AS ac_hexadecimal,
       ac.rgb AS ac_rgb,
       ac.created_at AS created_at,
       ac.updated_at AS updated_at,
       ac.deleted_at AS deleted_at
FROM aux_cor ac;
-- -----------------------------------------------------------------------------
-- view_bootstrap_icons
-- Base: bootstrap_icons (bi), sem junção.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_bootstrap_icons`;
CREATE VIEW `view_bootstrap_icons` AS
SELECT bi.id AS id,
       bi.name AS bi_name,
       bi.codepoint AS bi_codepoint,
       bi.is_favorite AS bi_is_favorite,
       bi.created_at AS created_at,
       bi.updated_at AS updated_at,
       bi.deleted_at AS deleted_at
FROM bootstrap_icons bi;
-- -----------------------------------------------------------------------------
-- view_calendar_event_attachments
-- Base: calendar_event_attachments (cea), com junção à esquerda de calendar_events (ce).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_event_attachments`;
CREATE VIEW `view_calendar_event_attachments` AS
SELECT cea.id AS id,
       cea.calendar_event_id AS cea_calendar_event_id,
       cea.file_url AS cea_file_url,
       cea.title AS cea_title,
       cea.mime_type AS cea_mime_type,
       cea.icon_link AS cea_icon_link,
       cea.file_id AS cea_file_id,
       ce.id AS ce_id,
       ce.calendar_id AS ce_calendar_id,
       ce.user_manager_id AS ce_user_manager_id,
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
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       cea.created_at AS created_at,
       cea.updated_at AS updated_at,
       cea.deleted_at AS deleted_at
FROM calendar_event_attachments cea
       LEFT JOIN calendar_events ce ON (
              ce.id = cea.calendar_event_id
              AND ce.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_attendees
-- Base: calendar_event_attendees (ceat), com junção à esquerda de calendar_events (ce), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_event_attendees`;
CREATE VIEW `view_calendar_event_attendees` AS
SELECT ceat.id AS id,
       ceat.calendar_event_id AS ceat_calendar_event_id,
       ceat.user_manager_id AS ceat_user_manager_id,
       ceat.email AS ceat_email,
       ceat.display_name AS ceat_display_name,
       ceat.is_organizer AS ceat_is_organizer,
       ceat.is_self AS ceat_is_self,
       ceat.is_resource AS ceat_is_resource,
       ceat.is_optional AS ceat_is_optional,
       ceat.response_status AS ceat_response_status,
       ceat.comment AS ceat_comment,
       ce.id AS ce_id,
       ce.calendar_id AS ce_calendar_id,
       ce.user_manager_id AS ce_user_manager_id,
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
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       ceat.created_at AS created_at,
       ceat.updated_at AS updated_at,
       ceat.deleted_at AS deleted_at
FROM calendar_event_attendees ceat
       LEFT JOIN calendar_events ce ON (
              ce.id = ceat.calendar_event_id
              AND ce.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = ceat.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_extended_properties
-- Base: calendar_event_extended_properties (ceep), com junção à esquerda de calendar_events (ce).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_event_extended_properties`;
CREATE VIEW `view_calendar_event_extended_properties` AS
SELECT ceep.id AS id,
       ceep.calendar_event_id AS ceep_calendar_event_id,
       ceep.scope AS ceep_scope,
       ceep.property_key AS ceep_property_key,
       ceep.property_value AS ceep_property_value,
       ce.id AS ce_id,
       ce.calendar_id AS ce_calendar_id,
       ce.user_manager_id AS ce_user_manager_id,
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
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       ceep.created_at AS created_at,
       ceep.updated_at AS updated_at,
       ceep.deleted_at AS deleted_at
FROM calendar_event_extended_properties ceep
       LEFT JOIN calendar_events ce ON (
              ce.id = ceep.calendar_event_id
              AND ce.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_invites
-- Base: calendar_event_invites (cei), com junção à esquerda de calendar_events (ce), user_manager (um), user_profiles (uc), user_manager (cu), user_profiles (cuc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_event_invites`;
CREATE VIEW `view_calendar_event_invites` AS
SELECT cei.id AS id,
       cei.calendar_event_id AS cei_calendar_event_id,
       cei.user_manager_id AS cei_user_manager_id,
       cei.email AS cei_email,
       cei.created_by AS cei_created_by,
       cei.token_hash AS cei_token_hash,
       cei.expires_at AS cei_expires_at,
       cei.used_at AS cei_used_at,
       ce.id AS ce_id,
       ce.calendar_id AS ce_calendar_id,
       ce.user_manager_id AS ce_user_manager_id,
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
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cu.id AS cu_id,
       cu.username AS cu_username,
       cu.status AS cu_status,
       cu.user_role_id AS cu_user_role_id,
       cu.last_login_at AS cu_last_login_at,
       cu.created_at AS cu_created_at,
       cu.updated_at AS cu_updated_at,
       cu.deleted_at AS cu_deleted_at,
       cuc.id AS cuc_id,
       cuc.user_manager_id AS cuc_user_manager_id,
       cuc.uuid AS cuc_uuid,
       cuc.name AS cuc_name,
       cuc.phone AS cuc_phone,
       cuc.whatsapp AS cuc_whatsapp,
       cuc.email AS cuc_email,
       cuc.cpf AS cuc_cpf,
       cuc.cep AS cuc_cep,
       cuc.address AS cuc_address,
       cuc.created_at AS cuc_created_at,
       cuc.updated_at AS cuc_updated_at,
       cuc.deleted_at AS cuc_deleted_at,
       cei.created_at AS created_at,
       cei.updated_at AS updated_at,
       cei.deleted_at AS deleted_at
FROM calendar_event_invites cei
       LEFT JOIN calendar_events ce ON (
              ce.id = cei.calendar_event_id
              AND ce.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = cei.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       )
       LEFT JOIN user_manager cu ON (
              cu.id = cei.created_by
              AND cu.deleted_at IS NULL
       )
       LEFT JOIN user_profiles cuc ON (
              cuc.user_manager_id = cu.id
              AND cuc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_reminders
-- Base: calendar_event_reminders (cer), com junção à esquerda de calendar_events (ce).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_calendar_event_reminders`;
CREATE VIEW `view_calendar_event_reminders` AS
SELECT cer.id AS id,
       cer.calendar_event_id AS cer_calendar_event_id,
       cer.method AS cer_method,
       cer.minutes AS cer_minutes,
       ce.id AS ce_id,
       ce.calendar_id AS ce_calendar_id,
       ce.user_manager_id AS ce_user_manager_id,
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
       ce.created_at AS ce_created_at,
       ce.updated_at AS ce_updated_at,
       ce.deleted_at AS ce_deleted_at,
       cer.created_at AS created_at,
       cer.updated_at AS updated_at,
       cer.deleted_at AS deleted_at
FROM calendar_event_reminders cer
       LEFT JOIN calendar_events ce ON (
              ce.id = cer.calendar_event_id
              AND ce.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_message_edits
-- Base: chat_message_edits (cme), com junção à esquerda de chat_messages (cm), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_message_edits`;
CREATE VIEW `view_chat_message_edits` AS
SELECT cme.id AS id,
       cme.chat_message_id AS cme_chat_message_id,
       cme.content_before AS cme_content_before,
       cme.edited_by_user_manager_id AS cme_edited_by_user_manager_id,
       cm.id AS cm_id,
       cm.chat_rooms_manager_id AS cm_chat_rooms_manager_id,
       cm.user_manager_id AS cm_user_manager_id,
       cm.content AS cm_content,
       cm.status AS cm_status,
       cm.created_at AS cm_created_at,
       cm.updated_at AS cm_updated_at,
       cm.deleted_at AS cm_deleted_at,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cme.created_at AS created_at,
       cme.updated_at AS updated_at
FROM chat_message_edits cme
       LEFT JOIN chat_messages cm ON (
              cm.id = cme.chat_message_id
              AND cm.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = cme.edited_by_user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_chat_message_mentions
-- Base: chat_message_mentions (cmm), com junção à esquerda de chat_messages (cm), user_manager (um), user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_chat_message_mentions`;
CREATE VIEW `view_chat_message_mentions` AS
SELECT cmm.id AS id,
       cmm.chat_message_id AS cmm_chat_message_id,
       cmm.user_manager_id AS cmm_user_manager_id,
       cm.id AS cm_id,
       cm.chat_rooms_manager_id AS cm_chat_rooms_manager_id,
       cm.user_manager_id AS cm_user_manager_id,
       cm.content AS cm_content,
       cm.status AS cm_status,
       cm.created_at AS cm_created_at,
       cm.updated_at AS cm_updated_at,
       cm.deleted_at AS cm_deleted_at,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.id AS uc_id,
       uc.user_manager_id AS uc_user_manager_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.email AS uc_email,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       cmm.created_at AS created_at,
       cmm.updated_at AS updated_at,
       cmm.deleted_at AS deleted_at
FROM chat_message_mentions cmm
       LEFT JOIN chat_messages cm ON (
              cm.id = cmm.chat_message_id
              AND cm.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = cmm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_list_actions
-- Base: list_actions (la), com junção à esquerda de list_manager (lm).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_list_actions`;
CREATE VIEW `view_list_actions` AS
SELECT la.id AS id,
       la.list_manager_id AS la_list_manager_id,
       la.sort_order AS la_sort_order,
       la.label AS la_label,
       la.icon AS la_icon,
       la.action_type AS la_action_type,
       la.href_template AS la_href_template,
       la.api_endpoint AS la_api_endpoint,
       la.http_method AS la_http_method,
       la.data_action AS la_data_action,
       la.target AS la_target,
       la.confirm AS la_confirm,
       la.confirm_message AS la_confirm_message,
       la.extra_data_json AS la_extra_data_json,
       la.roles AS la_roles,
       la.business_rule_json AS la_business_rule_json,
       lm.id AS lm_id,
       lm.slug AS lm_slug,
       lm.table_name AS lm_table_name,
       lm.title AS lm_title,
       lm.description AS lm_description,
       lm.api_get_endpoint AS lm_api_get_endpoint,
       lm.api_search_endpoint AS lm_api_search_endpoint,
       lm.roles AS lm_roles,
       lm.default_sort AS lm_default_sort,
       lm.default_order AS lm_default_order,
       lm.default_limit AS lm_default_limit,
       lm.limit_options_json AS lm_limit_options_json,
       lm.status AS lm_status,
       lm.version AS lm_version,
       lm.created_at AS lm_created_at,
       lm.updated_at AS lm_updated_at,
       lm.deleted_at AS lm_deleted_at,
       la.created_at AS created_at,
       la.updated_at AS updated_at,
       la.deleted_at AS deleted_at
FROM list_actions la
       LEFT JOIN list_manager lm ON (
              lm.id = la.list_manager_id
              AND lm.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_list_columns
-- Base: list_columns (lc), com junção à esquerda de list_manager (lm).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_list_columns`;
CREATE VIEW `view_list_columns` AS
SELECT lc.id AS id,
       lc.list_manager_id AS lc_list_manager_id,
       lc.sort_order AS lc_sort_order,
       lc.label AS lc_label,
       lc.field_key AS lc_field_key,
       lc.concat_json AS lc_concat_json,
       lc.format AS lc_format,
       lc.cell_class AS lc_cell_class,
       lc.fallback AS lc_fallback,
       lc.sortable AS lc_sortable,
       lc.sort_key AS lc_sort_key,
       lc.sort_concat_json AS lc_sort_concat_json,
       lc.visible AS lc_visible,
       lm.id AS lm_id,
       lm.slug AS lm_slug,
       lm.table_name AS lm_table_name,
       lm.title AS lm_title,
       lm.description AS lm_description,
       lm.api_get_endpoint AS lm_api_get_endpoint,
       lm.api_search_endpoint AS lm_api_search_endpoint,
       lm.roles AS lm_roles,
       lm.default_sort AS lm_default_sort,
       lm.default_order AS lm_default_order,
       lm.default_limit AS lm_default_limit,
       lm.limit_options_json AS lm_limit_options_json,
       lm.status AS lm_status,
       lm.version AS lm_version,
       lm.created_at AS lm_created_at,
       lm.updated_at AS lm_updated_at,
       lm.deleted_at AS lm_deleted_at,
       lc.created_at AS created_at,
       lc.updated_at AS updated_at,
       lc.deleted_at AS deleted_at
FROM list_columns lc
       LEFT JOIN list_manager lm ON (
              lm.id = lc.list_manager_id
              AND lm.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_list_manager
-- Base: list_manager (lm), sem junção.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_list_manager`;
CREATE VIEW `view_list_manager` AS
SELECT lm.id AS id,
       lm.slug AS lm_slug,
       lm.table_name AS lm_table_name,
       lm.title AS lm_title,
       lm.description AS lm_description,
       lm.api_get_endpoint AS lm_api_get_endpoint,
       lm.api_search_endpoint AS lm_api_search_endpoint,
       lm.roles AS lm_roles,
       lm.default_sort AS lm_default_sort,
       lm.default_order AS lm_default_order,
       lm.default_limit AS lm_default_limit,
       lm.limit_options_json AS lm_limit_options_json,
       lm.status AS lm_status,
       lm.version AS lm_version,
       lm.created_at AS created_at,
       lm.updated_at AS updated_at,
       lm.deleted_at AS deleted_at
FROM list_manager lm;
-- -----------------------------------------------------------------------------
-- view_menu_manager
-- Base: menu_manager (mm), com junção à esquerda de nav_manager (nm), menu_manager (pm).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_menu_manager`;
CREATE VIEW `view_menu_manager` AS
SELECT mm.id AS id,
       mm.nav_manager_id AS mm_nav_manager_id,
       mm.parent_id AS mm_parent_id,
       mm.title AS mm_title,
       mm.react_route AS mm_react_route,
       mm.icon AS mm_icon,
       mm.placement AS mm_placement,
       mm.is_bookmark AS mm_is_bookmark,
       mm.roles AS mm_roles,
       mm.sort_order AS mm_sort_order,
       mm.status AS mm_status,
       nm.id AS nm_id,
       nm.title AS nm_title,
       nm.image AS nm_image,
       nm.message_icon AS nm_message_icon,
       nm.system_version AS nm_system_version,
       nm.status AS nm_status,
       nm.created_at AS nm_created_at,
       nm.updated_at AS nm_updated_at,
       nm.deleted_at AS nm_deleted_at,
       pm.id AS pm_id,
       pm.nav_manager_id AS pm_nav_manager_id,
       pm.parent_id AS pm_parent_id,
       pm.title AS pm_title,
       pm.react_route AS pm_react_route,
       pm.icon AS pm_icon,
       pm.placement AS pm_placement,
       pm.is_bookmark AS pm_is_bookmark,
       pm.roles AS pm_roles,
       pm.sort_order AS pm_sort_order,
       pm.status AS pm_status,
       pm.created_at AS pm_created_at,
       pm.updated_at AS pm_updated_at,
       pm.deleted_at AS pm_deleted_at,
       mm.created_at AS created_at,
       mm.updated_at AS updated_at,
       mm.deleted_at AS deleted_at
FROM menu_manager mm
       LEFT JOIN nav_manager nm ON (
              nm.id = mm.nav_manager_id
              AND nm.deleted_at IS NULL
       )
       LEFT JOIN menu_manager pm ON (
              pm.id = mm.parent_id
              AND pm.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_nav_manager
-- Base: nav_manager (nm), sem junção.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_nav_manager`;
CREATE VIEW `view_nav_manager` AS
SELECT nm.id AS id,
       nm.title AS nm_title,
       nm.image AS nm_image,
       nm.message_icon AS nm_message_icon,
       nm.system_version AS nm_system_version,
       nm.status AS nm_status,
       nm.created_at AS created_at,
       nm.updated_at AS updated_at,
       nm.deleted_at AS deleted_at
FROM nav_manager nm;
-- -----------------------------------------------------------------------------
-- view_route_manager
-- Base: route_manager (rm), sem junção.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_route_manager`;
CREATE VIEW `view_route_manager` AS
SELECT rm.id AS id,
       rm.layer AS rm_layer,
       rm.object AS rm_object,
       rm.action AS rm_action,
       rm.method AS rm_method,
       rm.endpoint AS rm_endpoint,
       rm.controller_method AS rm_controller_method,
       rm.created_at AS created_at,
       rm.updated_at AS updated_at,
       rm.deleted_at AS deleted_at
FROM route_manager rm;
-- -----------------------------------------------------------------------------
-- view_messages_manager
-- Base: messages_manager (mm), com junção à esquerda de user_manager (sm) e
-- user_profiles (sc) do REMETENTE, user_manager (rm) e user_profiles (rc) do
-- DESTINATÁRIO, message_group_messages (mgl) e message_groups_manager (mg)
-- (grupo da mensagem, quando for mensagem de grupo).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_messages_manager`;
CREATE VIEW `view_messages_manager` AS
SELECT mm.id AS id,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.recipient_user_manager_id AS mm_recipient_user_manager_id,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.scheduled_at AS mm_scheduled_at,
       mm.sent_at AS mm_sent_at,
       mm.read_at AS mm_read_at,
       sm.id AS sm_id,
       sm.username AS sm_username,
       sm.status AS sm_status,
       sc.id AS sc_id,
       sc.uuid AS sc_uuid,
       sc.name AS sc_name,
       sc.email AS sc_email,
       rm.id AS rm_id,
       rm.username AS rm_username,
       rm.status AS rm_status,
       rc.id AS rc_id,
       rc.uuid AS rc_uuid,
       rc.name AS rc_name,
       rc.email AS rc_email,
       mg.id AS mg_id,
       mg.name AS mg_name,
       sm.user_role_id AS sm_user_role_id,
       sm.last_login_at AS sm_last_login_at,
       sm.created_at AS sm_created_at,
       sm.updated_at AS sm_updated_at,
       sm.deleted_at AS sm_deleted_at,
       sc.user_manager_id AS sc_user_manager_id,
       sc.phone AS sc_phone,
       sc.whatsapp AS sc_whatsapp,
       sc.cpf AS sc_cpf,
       sc.cep AS sc_cep,
       sc.address AS sc_address,
       sc.created_at AS sc_created_at,
       sc.updated_at AS sc_updated_at,
       sc.deleted_at AS sc_deleted_at,
       rm.user_role_id AS rm_user_role_id,
       rm.last_login_at AS rm_last_login_at,
       rm.created_at AS rm_created_at,
       rm.updated_at AS rm_updated_at,
       rm.deleted_at AS rm_deleted_at,
       rc.user_manager_id AS rc_user_manager_id,
       rc.phone AS rc_phone,
       rc.whatsapp AS rc_whatsapp,
       rc.cpf AS rc_cpf,
       rc.cep AS rc_cep,
       rc.address AS rc_address,
       rc.created_at AS rc_created_at,
       rc.updated_at AS rc_updated_at,
       rc.deleted_at AS rc_deleted_at,
       mgl.id AS mgl_id,
       mgl.messages_manager_id AS mgl_messages_manager_id,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mgl.created_at AS mgl_created_at,
       mgl.updated_at AS mgl_updated_at,
       mgl.deleted_at AS mgl_deleted_at,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       mg.description AS mg_description,
       mg.status AS mg_status,
       mg.created_at AS mg_created_at,
       mg.updated_at AS mg_updated_at,
       mg.deleted_at AS mg_deleted_at,
       mm.created_at AS created_at,
       mm.updated_at AS updated_at,
       mm.deleted_at AS deleted_at
FROM messages_manager mm
       LEFT JOIN user_manager sm ON (
              sm.id = mm.sender_user_manager_id
              AND sm.deleted_at IS NULL
       )
       LEFT JOIN user_profiles sc ON (
              sc.user_manager_id = sm.id
              AND sc.deleted_at IS NULL
       )
       LEFT JOIN user_manager rm ON (
              rm.id = mm.recipient_user_manager_id
              AND rm.deleted_at IS NULL
       )
       LEFT JOIN user_profiles rc ON (
              rc.user_manager_id = rm.id
              AND rc.deleted_at IS NULL
       )
       LEFT JOIN message_group_messages mgl ON (
              mgl.messages_manager_id = mm.id
              AND mgl.deleted_at IS NULL
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgl.message_groups_manager_id
              AND mg.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_messages_users
-- VIEW AGREGADA (resumo por interlocutor), sem tabela base única: uma linha por
-- par (owner, peer) de mensagens 1 para 1 (recipient_user_manager_id NOT NULL).
-- Perspectiva do remetente conta scheduled e sent; a do destinatário só sent;
-- removed, blocked e excluídas não entram. `id` = owner * 4294967296 + peer.
-- Junção à esquerda de user_manager (om/pm) e user_profiles (oc/pc) só para
-- identificar as duas pessoas — a regra de "todas as colunas" não se aplica
-- a view agregada (e evita expor dados pessoais do interlocutor no resumo).
-- `deleted_at` é sempre NULL (as rotas get-deleted* respondem vazio).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_messages_users`;
CREATE VIEW `view_messages_users` AS
SELECT CAST(agg.owner_id * 4294967296 + agg.peer_id AS UNSIGNED) AS id,
       agg.owner_id AS mu_owner_user_manager_id,
       agg.peer_id AS mu_peer_user_manager_id,
       agg.messages_count AS mu_messages_count,
       agg.unread_count AS mu_unread_count,
       lm.id AS mu_last_message_id,
       lm.content AS mu_last_content,
       lm.status AS mu_last_status,
       lm.sender_user_manager_id AS mu_last_sender_user_manager_id,
       COALESCE(lm.sent_at, lm.created_at) AS mu_last_message_at,
       om.id AS om_id,
       om.username AS om_username,
       oc.name AS oc_name,
       pm.id AS pm_id,
       pm.username AS pm_username,
       pm.status AS pm_status,
       pc.uuid AS pc_uuid,
       pc.name AS pc_name,
       pc.email AS pc_email,
       agg.first_at AS created_at,
       COALESCE(lm.sent_at, lm.created_at) AS updated_at,
       NULL AS deleted_at
FROM (
              SELECT p.owner_id,
                     p.peer_id,
                     MAX(p.message_id) AS last_id,
                     COUNT(*) AS messages_count,
                     SUM(
                            p.received = 1
                            AND p.read_at IS NULL
                     ) AS unread_count,
                     MIN(p.created_at) AS first_at
              FROM (
                            SELECT sender_user_manager_id AS owner_id,
                                   recipient_user_manager_id AS peer_id,
                                   id AS message_id,
                                   created_at,
                                   read_at,
                                   0 AS received
                            FROM messages_manager
                            WHERE deleted_at IS NULL
                                   AND recipient_user_manager_id IS NOT NULL
                                   AND status IN ('scheduled', 'sent')
                            UNION ALL
                            SELECT recipient_user_manager_id,
                                   sender_user_manager_id,
                                   id,
                                   created_at,
                                   read_at,
                                   1
                            FROM messages_manager
                            WHERE deleted_at IS NULL
                                   AND recipient_user_manager_id IS NOT NULL
                                   AND status = 'sent'
                     ) p
              GROUP BY p.owner_id,
                     p.peer_id
       ) agg
       JOIN messages_manager lm ON lm.id = agg.last_id
       LEFT JOIN user_manager om ON (
              om.id = agg.owner_id
              AND om.deleted_at IS NULL
       )
       LEFT JOIN user_profiles oc ON (
              oc.user_manager_id = om.id
              AND oc.deleted_at IS NULL
       )
       LEFT JOIN user_manager pm ON (
              pm.id = agg.peer_id
              AND pm.deleted_at IS NULL
       )
       LEFT JOIN user_profiles pc ON (
              pc.user_manager_id = pm.id
              AND pc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_message_groups_manager
-- Base: message_groups_manager (mg), com junção à esquerda de user_manager (um)
-- e user_profiles (uc) do DONO, mais os contadores members_count e
-- messages_count.
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_groups_manager`;
CREATE VIEW `view_message_groups_manager` AS
SELECT mg.id AS id,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       mg.name AS mg_name,
       mg.description AS mg_description,
       mg.status AS mg_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
(
              SELECT COUNT(*)
              FROM message_group_members m
              WHERE (
                            m.message_groups_manager_id = mg.id
                            AND m.deleted_at IS NULL
                            AND (m.status = 'active')
                     )
       ) AS members_count,
(
              SELECT COUNT(*)
              FROM message_group_messages l
                     JOIN messages_manager x ON (
                            x.id = l.messages_manager_id
                            AND x.deleted_at IS NULL
                     )
              WHERE (
                            l.message_groups_manager_id = mg.id
                            AND l.deleted_at IS NULL
                     )
       ) AS messages_count,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       mg.created_at AS created_at,
       mg.updated_at AS updated_at,
       mg.deleted_at AS deleted_at
FROM message_groups_manager mg
       LEFT JOIN user_manager um ON (
              um.id = mg.owner_user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_message_group_members
-- Base: message_group_members (mgm), com junção à esquerda de
-- message_groups_manager (mg), user_manager (um) e user_profiles (uc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_members`;
CREATE VIEW `view_message_group_members` AS
SELECT mgm.id AS id,
       mgm.message_groups_manager_id AS mgm_message_groups_manager_id,
       mgm.user_manager_id AS mgm_user_manager_id,
       mgm.role AS mgm_role,
       mgm.status AS mgm_status,
       mg.id AS mg_id,
       mg.name AS mg_name,
       mg.status AS mg_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       mg.description AS mg_description,
       mg.created_at AS mg_created_at,
       mg.updated_at AS mg_updated_at,
       mg.deleted_at AS mg_deleted_at,
       um.user_role_id AS um_user_role_id,
       um.last_login_at AS um_last_login_at,
       um.created_at AS um_created_at,
       um.updated_at AS um_updated_at,
       um.deleted_at AS um_deleted_at,
       uc.user_manager_id AS uc_user_manager_id,
       uc.phone AS uc_phone,
       uc.whatsapp AS uc_whatsapp,
       uc.cpf AS uc_cpf,
       uc.cep AS uc_cep,
       uc.address AS uc_address,
       uc.created_at AS uc_created_at,
       uc.updated_at AS uc_updated_at,
       uc.deleted_at AS uc_deleted_at,
       mgm.created_at AS created_at,
       mgm.updated_at AS updated_at,
       mgm.deleted_at AS deleted_at
FROM message_group_members mgm
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgm.message_groups_manager_id
              AND mg.deleted_at IS NULL
       )
       LEFT JOIN user_manager um ON (
              um.id = mgm.user_manager_id
              AND um.deleted_at IS NULL
       )
       LEFT JOIN user_profiles uc ON (
              uc.user_manager_id = um.id
              AND uc.deleted_at IS NULL
       );
-- -----------------------------------------------------------------------------
-- view_message_group_messages
-- Base: message_group_messages (mgl), com junção à esquerda de messages_manager
-- (mm), message_groups_manager (mg) e, do REMETENTE da mensagem, user_manager
-- (sm) e user_profiles (sc).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_messages`;
CREATE VIEW `view_message_group_messages` AS
SELECT mgl.id AS id,
       mgl.messages_manager_id AS mgl_messages_manager_id,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mm.id AS mm_id,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.scheduled_at AS mm_scheduled_at,
       mm.sent_at AS mm_sent_at,
       mg.id AS mg_id,
       mg.name AS mg_name,
       mg.status AS mg_status,
       sm.id AS sm_id,
       sm.username AS sm_username,
       sc.uuid AS sc_uuid,
       sc.name AS sc_name,
       mm.recipient_user_manager_id AS mm_recipient_user_manager_id,
       mm.read_at AS mm_read_at,
       mm.created_at AS mm_created_at,
       mm.updated_at AS mm_updated_at,
       mm.deleted_at AS mm_deleted_at,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       mg.description AS mg_description,
       mg.created_at AS mg_created_at,
       mg.updated_at AS mg_updated_at,
       mg.deleted_at AS mg_deleted_at,
       sm.status AS sm_status,
       sm.user_role_id AS sm_user_role_id,
       sm.last_login_at AS sm_last_login_at,
       sm.created_at AS sm_created_at,
       sm.updated_at AS sm_updated_at,
       sm.deleted_at AS sm_deleted_at,
       sc.id AS sc_id,
       sc.user_manager_id AS sc_user_manager_id,
       sc.email AS sc_email,
       sc.phone AS sc_phone,
       sc.whatsapp AS sc_whatsapp,
       sc.cpf AS sc_cpf,
       sc.cep AS sc_cep,
       sc.address AS sc_address,
       sc.created_at AS sc_created_at,
       sc.updated_at AS sc_updated_at,
       sc.deleted_at AS sc_deleted_at,
       mgl.created_at AS created_at,
       mgl.updated_at AS updated_at,
       mgl.deleted_at AS deleted_at
FROM message_group_messages mgl
       LEFT JOIN messages_manager mm ON (
              mm.id = mgl.messages_manager_id
              AND mm.deleted_at IS NULL
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgl.message_groups_manager_id
              AND mg.deleted_at IS NULL
       )
       LEFT JOIN user_manager sm ON (
              sm.id = mm.sender_user_manager_id
              AND sm.deleted_at IS NULL
       )
       LEFT JOIN user_profiles sc ON (
              sc.user_manager_id = sm.id
              AND sc.deleted_at IS NULL
       );
