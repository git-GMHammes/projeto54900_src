/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET NAMES utf8 */
;
/*!50503 SET NAMES utf8mb4 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;
-- -----------------------------------------------------------------------------
-- Views do banco codeigniter54900_db — dump formatado em 2026-10-12.
-- Fonte: definição real de cada view no banco DEV (SHOW CREATE VIEW), lida
-- diretamente do banco — nenhuma view espelha outra view ou markdown.
-- Total: 63 views.
-- Ordem: view_aux_cor, view_bootstrap_icons, view_calendar_event_attachments,
-- view_calendar_event_attendees, view_calendar_event_extended_properties,
-- view_calendar_event_invites, view_calendar_event_reminders,
-- view_calendar_manager, view_chat_message_edits, view_chat_message_mentions,
-- view_chat_messages, view_chat_room_attachment_reports,
-- view_chat_room_attachments, view_chat_room_favorites,
-- view_chat_room_members, view_chat_room_warnings, view_chat_rooms_manager,
-- view_company_manager, view_company_members, view_company_memberships,
-- view_company_users_companies, view_form_manager, view_list_actions,
-- view_list_columns, view_list_manager, view_map_addresses,
-- view_map_categories, view_map_geocode_cache, view_map_icons,
-- view_map_links, view_map_manager, view_map_points, view_map_postal_codes,
-- view_map_route_stops, view_map_routes, view_menu_manager,
-- view_message_attachments, view_message_contacts,
-- view_message_group_chat_summary, view_message_group_members,
-- view_message_group_memberships, view_message_group_messages,
-- view_message_group_posts, view_message_group_reads,
-- view_message_groups_manager, view_message_mentions,
-- view_message_users_groups, view_message_warnings, view_messages_manager,
-- view_messages_users, view_nav_manager, view_route_manager,
-- view_timeline_manager, view_timeline_post_attachments,
-- view_timeline_post_comments, view_timeline_post_ratings,
-- view_timeline_post_reactions, view_timeline_post_reports,
-- view_timeline_posts, view_upload_manager, view_user_directory,
-- view_user_manager, view_user_resource_access.
-- -----------------------------------------------------------------------------
SET NAMES utf8mb4;
-- -----------------------------------------------------------------------------
-- view_aux_cor
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
              (ce.id = cea.calendar_event_id)
              AND (ce.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_attendees
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
              (ce.id = ceat.calendar_event_id)
              AND (ce.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = ceat.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_extended_properties
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
              (ce.id = ceep.calendar_event_id)
              AND (ce.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_invites
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
              (ce.id = cei.calendar_event_id)
              AND (ce.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cei.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager cu ON (
              (cu.id = cei.created_by)
              AND (cu.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles cuc ON (
              (cuc.user_manager_id = cu.id)
              AND (cuc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_calendar_event_reminders
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
              (ce.id = cer.calendar_event_id)
              AND (ce.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_calendar_manager
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
              (ce.calendar_id = cm.id)
              AND (ce.deleted_at IS NULL)
       )
WHERE (cm.deleted_at IS NULL);
-- -----------------------------------------------------------------------------
-- view_chat_message_edits
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
              (cm.id = cme.chat_message_id)
              AND (cm.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cme.edited_by_user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_message_mentions
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
              (cm.id = cmm.chat_message_id)
              AND (cm.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cmm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_messages
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
              SELECT count(0)
              FROM chat_room_attachments a
              WHERE ((a.chat_message_id = cm.id) AND (a.deleted_at IS NULL) AND (a.status = 'active'))
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
              (cr.id = cm.chat_rooms_manager_id)
              AND (cr.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_attachment_reports
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
              (cra.id = crar.chat_room_attachment_id)
              AND (cra.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = crar.reporter_user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager mu ON (
              (mu.id = crar.reviewed_by)
              AND (mu.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles muc ON (
              (muc.user_manager_id = mu.id)
              AND (muc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_attachments
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
              (cm.id = cra.chat_message_id)
              AND (cm.deleted_at IS NULL)
       )
       LEFT JOIN chat_rooms_manager cr ON (
              (cr.id = cm.chat_rooms_manager_id)
              AND (cr.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_favorites
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
              (cr.id = crf.chat_rooms_manager_id)
              AND (cr.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = crf.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_members
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
              (cr.id = crm.chat_rooms_manager_id)
              AND (cr.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = crm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_room_warnings
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
              (cr.id = crw.chat_rooms_manager_id)
              AND (cr.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = crw.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN chat_messages cm ON (
              (cm.id = crw.chat_message_id)
              AND (cm.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_chat_rooms_manager
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
              SELECT count(0)
              FROM chat_room_members m
              WHERE ((m.chat_rooms_manager_id = cr.id) AND (m.deleted_at IS NULL) AND (m.status = 'active'))
       ) AS members_count,
       (
              SELECT count(0)
              FROM chat_room_members bm
              WHERE ((bm.chat_rooms_manager_id = cr.id) AND (bm.deleted_at IS NULL) AND (bm.status = 'blocked'))
       ) AS blocked_members_count,
       (
              SELECT count(0)
              FROM chat_messages msg
              WHERE ((msg.chat_rooms_manager_id = cr.id) AND (msg.deleted_at IS NULL) AND (msg.status = 'sent'))
       ) AS messages_count,
       (
              SELECT count(0)
              FROM chat_room_favorites f
              WHERE ((f.chat_rooms_manager_id = cr.id) AND (f.deleted_at IS NULL))
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
              (um.id = cr.owner_user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_company_manager
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_company_manager`;
CREATE VIEW `view_company_manager` AS
SELECT co.id AS id,
       co.name AS co_name,
       co.slug AS co_slug,
       co.document AS co_document,
       co.status AS co_status,
       (
              SELECT count(0)
              FROM user_manager um
              WHERE ((um.deleted_at IS NULL) AND (um.company_ids IS NOT NULL) AND json_contains(um.company_ids,cast(co.id AS json)))
       ) AS users_count,
       co.created_at AS created_at,
       co.updated_at AS updated_at,
       co.deleted_at AS deleted_at
FROM company_manager co;
-- -----------------------------------------------------------------------------
-- view_company_members
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_company_members`;
CREATE VIEW `view_company_members` AS
SELECT cm.id AS id,
       cm.company_id AS cm_company_id,
       cm.user_manager_id AS cm_user_manager_id,
       cm.role AS cm_role,
       cm.status AS cm_status,
       co.id AS co_id,
       co.name AS co_name,
       co.slug AS co_slug,
       co.status AS co_status,
       um.id AS um_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.id AS uc_id,
       uc.uuid AS uc_uuid,
       uc.name AS uc_name,
       uc.email AS uc_email,
       co.document AS co_document,
       co.created_at AS co_created_at,
       co.updated_at AS co_updated_at,
       co.deleted_at AS co_deleted_at,
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
FROM company_members cm
       LEFT JOIN company_manager co ON (
              (co.id = cm.company_id)
              AND (co.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = cm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_company_memberships
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_company_memberships`;
CREATE VIEW `view_company_memberships` AS
SELECT co.id AS id,
       co.name AS co_name,
       co.slug AS co_slug,
       co.document AS co_document,
       co.status AS co_status,
       (
              SELECT count(0)
              FROM company_members m
              WHERE ((m.company_id = co.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_count,
       (
              SELECT (cast(left(group_concat(coalesce(pc.name,pu.username) ORDER BY coalesce(pc.name,pu.username) ASC separator ', '),500) AS char charset utf8mb4) collate utf8mb4_general_ci)
              FROM company_members m
                     JOIN user_manager pu ON (
                            (pu.id = m.user_manager_id)
                            AND (pu.deleted_at IS NULL)
                     )
                     LEFT JOIN user_profiles pc ON (
                            (pc.user_manager_id = pu.id)
                            AND (pc.deleted_at IS NULL)
                     )
              WHERE ((m.company_id = co.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_names,
       (
              SELECT (cast(left(group_concat(concat_ws(' ',pc.name,pu.username,regexp_replace(coalesce(pc.phone,''),'[^0-9]','')) ORDER BY pc.name ASC separator ' | '),1000) AS char charset utf8mb4) collate utf8mb4_general_ci)
              FROM company_members m
                     JOIN user_manager pu ON (
                            (pu.id = m.user_manager_id)
                            AND (pu.deleted_at IS NULL)
                     )
                     LEFT JOIN user_profiles pc ON (
                            (pc.user_manager_id = pu.id)
                            AND (pc.deleted_at IS NULL)
                     )
              WHERE ((m.company_id = co.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_search,
       co.created_at AS created_at,
       co.updated_at AS updated_at,
       co.deleted_at AS deleted_at
FROM company_manager co;
-- -----------------------------------------------------------------------------
-- view_company_users_companies
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_company_users_companies`;
CREATE VIEW `view_company_users_companies` AS
SELECT um.id AS id,
       cmx.company_id AS company_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.name AS uc_name,
       uc.email AS uc_email,
       (
              SELECT count(0)
              FROM company_members m
                     JOIN company_manager c ON (
                            (c.id = m.company_id)
                            AND (c.deleted_at IS NULL)
                     )
              WHERE ((m.user_manager_id = um.id) AND (m.status = 'active') AND (m.deleted_at IS NULL) AND (m.company_id = cmx.company_id))
       ) AS companies_count,
       (
              SELECT left(group_concat(c.name ORDER BY c.name ASC separator ', '),500)
              FROM company_members m
                     JOIN company_manager c ON (
                            (c.id = m.company_id)
                            AND (c.deleted_at IS NULL)
                     )
              WHERE ((m.user_manager_id = um.id) AND (m.status = 'active') AND (m.deleted_at IS NULL) AND (m.company_id = cmx.company_id))
       ) AS companies_names,
       um.created_at AS created_at,
       um.updated_at AS updated_at,
       um.deleted_at AS deleted_at
FROM user_manager um
       JOIN company_members cmx ON (
              (cmx.user_manager_id = um.id)
              AND (cmx.status = 'active')
              AND (cmx.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_form_manager
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
              (fg.form_manager_id = fm.id)
              AND (fg.deleted_at IS NULL)
       )
       LEFT JOIN form_rows fr ON (
              (fr.form_group_id = fg.id)
              AND (fr.deleted_at IS NULL)
       )
       LEFT JOIN form_fields fc ON (
              (fc.form_row_id = fr.id)
              AND (fc.deleted_at IS NULL)
       )
WHERE (fm.deleted_at IS NULL);
-- -----------------------------------------------------------------------------
-- view_list_actions
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
              (lm.id = la.list_manager_id)
              AND (lm.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_list_columns
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
              (lm.id = lc.list_manager_id)
              AND (lm.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_list_manager
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
-- view_map_addresses
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_addresses`;
CREATE VIEW `view_map_addresses` AS
SELECT ma.id AS id,
       ma.map_postal_code_id AS ma_map_postal_code_id,
       ma.cep AS ma_cep,
       ma.street AS ma_street,
       ma.number AS ma_number,
       ma.complement AS ma_complement,
       ma.neighborhood AS ma_neighborhood,
       ma.city AS ma_city,
       ma.state AS ma_state,
       ma.country AS ma_country,
       ma.lat AS ma_lat,
       ma.lng AS ma_lng,
       ma.geocode_source AS ma_geocode_source,
       ma.geocode_precision AS ma_geocode_precision,
       ma.osm_type AS ma_osm_type,
       ma.osm_id AS ma_osm_id,
       ma.display_name AS ma_display_name,
       ma.created_at AS created_at,
       ma.updated_at AS updated_at,
       ma.deleted_at AS deleted_at,
       mp.street AS mp_street,
       mp.neighborhood AS mp_neighborhood
FROM map_addresses ma
       LEFT JOIN map_postal_codes mp ON (
              (mp.id = ma.map_postal_code_id)
              AND (mp.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_map_categories
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_categories`;
CREATE VIEW `view_map_categories` AS
SELECT mc.id AS id,
       mc.map_manager_id AS mc_map_manager_id,
       mc.map_icon_id AS mc_map_icon_id,
       mc.name AS mc_name,
       mc.slug AS mc_slug,
       mc.color AS mc_color,
       mc.sort_order AS mc_sort_order,
       mc.status AS mc_status,
       mc.created_at AS created_at,
       mc.updated_at AS updated_at,
       mc.deleted_at AS deleted_at,
       mm.title AS mm_title,
       mi.icon_class AS mi_icon_class,
       mi.icon_type AS mi_icon_type
FROM map_categories mc
       JOIN map_manager mm ON (
              mm.id = mc.map_manager_id
       )
       LEFT JOIN map_icons mi ON (
              (mi.id = mc.map_icon_id)
              AND (mi.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_map_geocode_cache
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_geocode_cache`;
CREATE VIEW `view_map_geocode_cache` AS
SELECT gc.id AS id,
       gc.query_hash AS query_hash,
       gc.query_text AS query_text,
       gc.provider AS provider,
       gc.lat AS lat,
       gc.lng AS lng,
       gc.result_json AS result_json,
       gc.expires_at AS expires_at,
       gc.created_at AS created_at,
       gc.updated_at AS updated_at,
       gc.deleted_at AS deleted_at
FROM map_geocode_cache gc;
-- -----------------------------------------------------------------------------
-- view_map_icons
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_icons`;
CREATE VIEW `view_map_icons` AS
SELECT mi.id AS id,
       mi.name AS name,
       mi.icon_type AS icon_type,
       mi.icon_class AS icon_class,
       mi.upload_id AS upload_id,
       mi.color AS color,
       mi.size_w AS size_w,
       mi.size_h AS size_h,
       mi.anchor_x AS anchor_x,
       mi.anchor_y AS anchor_y,
       mi.status AS status,
       mi.created_at AS created_at,
       mi.updated_at AS updated_at,
       mi.deleted_at AS deleted_at
FROM map_icons mi;
-- -----------------------------------------------------------------------------
-- view_map_links
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_links`;
CREATE VIEW `view_map_links` AS
SELECT ml.id AS id,
       ml.module AS ml_module,
       ml.reference_id AS ml_reference_id,
       ml.collection AS ml_collection,
       ml.link_type AS ml_link_type,
       ml.map_postal_code_id AS ml_map_postal_code_id,
       ml.map_address_id AS ml_map_address_id,
       ml.map_point_id AS ml_map_point_id,
       ml.map_route_id AS ml_map_route_id,
       ml.label AS ml_label,
       ml.sort_order AS ml_sort_order,
       ml.status AS ml_status,
       ml.user_manager_id AS ml_user_manager_id,
       ml.created_at AS created_at,
       ml.updated_at AS updated_at,
       ml.deleted_at AS deleted_at,
       coalesce(pt.lat,ad.lat,pc.lat) AS target_lat,
       coalesce(pt.lng,ad.lng,pc.lng) AS target_lng,
       pc.cep AS pc_cep,
       pc.street AS pc_street,
       pc.city AS pc_city,
       pc.state AS pc_state,
       ad.cep AS ad_cep,
       ad.street AS ad_street,
       ad.number AS ad_number,
       ad.city AS ad_city,
       ad.state AS ad_state,
       ad.display_name AS ad_display_name,
       pt.name AS pt_name,
       pt.map_icon_id AS pt_map_icon_id,
       rt.name AS rt_name,
       rt.profile AS rt_profile,
       rt.distance_m AS rt_distance_m,
       rt.duration_s AS rt_duration_s,
       rt.geometry AS rt_geometry
FROM map_links ml
       LEFT JOIN map_postal_codes pc ON (
              (pc.id = ml.map_postal_code_id)
              AND (pc.deleted_at IS NULL)
       )
       LEFT JOIN map_addresses ad ON (
              (ad.id = ml.map_address_id)
              AND (ad.deleted_at IS NULL)
       )
       LEFT JOIN map_points pt ON (
              (pt.id = ml.map_point_id)
              AND (pt.deleted_at IS NULL)
       )
       LEFT JOIN map_routes rt ON (
              (rt.id = ml.map_route_id)
              AND (rt.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_map_manager
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_manager`;
CREATE VIEW `view_map_manager` AS
SELECT mm.id AS id,
       mm.user_manager_id AS user_manager_id,
       mm.slug AS slug,
       mm.title AS title,
       mm.description AS description,
       mm.center_lat AS center_lat,
       mm.center_lng AS center_lng,
       mm.zoom AS zoom,
       mm.min_zoom AS min_zoom,
       mm.max_zoom AS max_zoom,
       mm.tile_url AS tile_url,
       mm.attribution AS attribution,
       mm.roles AS roles,
       mm.status AS status,
       mm.version AS version,
       mm.created_at AS created_at,
       mm.updated_at AS updated_at,
       mm.deleted_at AS deleted_at
FROM map_manager mm;
-- -----------------------------------------------------------------------------
-- view_map_points
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_points`;
CREATE VIEW `view_map_points` AS
SELECT pt.id AS id,
       pt.map_manager_id AS pt_map_manager_id,
       pt.map_category_id AS pt_map_category_id,
       pt.map_icon_id AS pt_map_icon_id,
       pt.map_address_id AS pt_map_address_id,
       pt.user_manager_id AS pt_user_manager_id,
       pt.name AS pt_name,
       pt.description AS pt_description,
       pt.lat AS pt_lat,
       pt.lng AS pt_lng,
       pt.extra_json AS pt_extra_json,
       pt.status AS pt_status,
       pt.created_at AS created_at,
       pt.updated_at AS updated_at,
       pt.deleted_at AS deleted_at,
       mc.name AS mc_name,
       mc.color AS mc_color,
       coalesce(mi.icon_class,ci.icon_class) AS mi_icon_class,
       coalesce(mi.icon_type,ci.icon_type) AS mi_icon_type,
       ma.cep AS ma_cep,
       ma.street AS ma_street,
       ma.number AS ma_number,
       ma.city AS ma_city,
       ma.state AS ma_state
FROM map_points pt
       LEFT JOIN map_categories mc ON (
              (mc.id = pt.map_category_id)
              AND (mc.deleted_at IS NULL)
       )
       LEFT JOIN map_icons mi ON (
              (mi.id = pt.map_icon_id)
              AND (mi.deleted_at IS NULL)
       )
       LEFT JOIN map_icons ci ON (
              (ci.id = mc.map_icon_id)
              AND (ci.deleted_at IS NULL)
       )
       LEFT JOIN map_addresses ma ON (
              (ma.id = pt.map_address_id)
              AND (ma.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_map_postal_codes
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_postal_codes`;
CREATE VIEW `view_map_postal_codes` AS
SELECT mp.id AS id,
       mp.cep AS cep,
       mp.street AS street,
       mp.neighborhood AS neighborhood,
       mp.city AS city,
       mp.state AS state,
       mp.ibge_code AS ibge_code,
       mp.lat AS lat,
       mp.lng AS lng,
       mp.source AS source,
       mp.created_at AS created_at,
       mp.updated_at AS updated_at,
       mp.deleted_at AS deleted_at
FROM map_postal_codes mp;
-- -----------------------------------------------------------------------------
-- view_map_route_stops
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_route_stops`;
CREATE VIEW `view_map_route_stops` AS
SELECT rs.id AS id,
       rs.map_route_id AS rs_map_route_id,
       rs.map_point_id AS rs_map_point_id,
       rs.map_address_id AS rs_map_address_id,
       rs.label AS rs_label,
       rs.lat AS rs_lat,
       rs.lng AS rs_lng,
       rs.sort_order AS rs_sort_order,
       rs.leg_distance_m AS rs_leg_distance_m,
       rs.leg_duration_s AS rs_leg_duration_s,
       rs.service_time_s AS rs_service_time_s,
       rs.eta AS rs_eta,
       rs.created_at AS created_at,
       rs.updated_at AS updated_at,
       rs.deleted_at AS deleted_at,
       mr.name AS mr_name,
       pt.name AS pt_name,
       ma.display_name AS ma_display_name
FROM map_route_stops rs
       JOIN map_routes mr ON (
              mr.id = rs.map_route_id
       )
       LEFT JOIN map_points pt ON (
              (pt.id = rs.map_point_id)
              AND (pt.deleted_at IS NULL)
       )
       LEFT JOIN map_addresses ma ON (
              (ma.id = rs.map_address_id)
              AND (ma.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_map_routes
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_map_routes`;
CREATE VIEW `view_map_routes` AS
SELECT mr.id AS id,
       mr.map_manager_id AS mr_map_manager_id,
       mr.user_manager_id AS mr_user_manager_id,
       mr.name AS mr_name,
       mr.profile AS mr_profile,
       mr.distance_m AS mr_distance_m,
       mr.duration_s AS mr_duration_s,
       mr.geometry AS mr_geometry,
       mr.bbox AS mr_bbox,
       mr.provider AS mr_provider,
       mr.options_json AS mr_options_json,
       mr.calculated_at AS mr_calculated_at,
       mr.status AS mr_status,
       mr.created_at AS created_at,
       mr.updated_at AS updated_at,
       mr.deleted_at AS deleted_at,
       mm.title AS mm_title,
       (
              SELECT count(0)
              FROM map_route_stops s
              WHERE ((s.map_route_id = mr.id) AND (s.deleted_at IS NULL))
       ) AS stops_count
FROM map_routes mr
       JOIN map_manager mm ON (
              mm.id = mr.map_manager_id
       );
-- -----------------------------------------------------------------------------
-- view_menu_manager
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
              (nm.id = mm.nav_manager_id)
              AND (nm.deleted_at IS NULL)
       )
       LEFT JOIN menu_manager pm ON (
              (pm.id = mm.parent_id)
              AND (pm.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_attachments
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_attachments`;
CREATE VIEW `view_message_attachments` AS
SELECT a.id AS id,
       a.messages_manager_id AS mat_messages_manager_id,
       a.original_name AS mat_original_name,
       a.stored_name AS mat_stored_name,
       a.extension AS mat_extension,
       a.mime_type AS mat_mime_type,
       a.file_size AS mat_file_size,
       a.category AS mat_category,
       a.status AS mat_status,
       mm.id AS mm_id,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.recipient_user_manager_id AS mm_recipient_user_manager_id,
       mm.scheduled_at AS mm_scheduled_at,
       mm.sent_at AS mm_sent_at,
       mgl.id AS mgl_id,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mg.name AS mg_name,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       (CASE WHEN (mgl.id IS NOT NULL) THEN 'group' ELSE 'private' END) AS conversation_type,
       (CASE WHEN (mgl.id IS NOT NULL) THEN 'Grupo' ELSE 'Privada' END) AS conversation_label,
       coalesce(mg.name,rc.name,rm.username) AS destination_name,
       sm.username AS sm_username,
       sc.name AS sc_name,
       rm.username AS rm_username,
       rc.name AS rc_name,
       a.created_at AS created_at,
       a.updated_at AS updated_at,
       coalesce(a.deleted_at,mm.deleted_at) AS deleted_at
FROM message_attachments a
       JOIN messages_manager mm ON (
              mm.id = a.messages_manager_id
       )
       LEFT JOIN message_group_messages mgl ON (
              (mgl.messages_manager_id = mm.id)
              AND (mgl.deleted_at IS NULL)
       )
       LEFT JOIN message_groups_manager mg ON (
              (mg.id = mgl.message_groups_manager_id)
              AND (mg.deleted_at IS NULL)
       )
       LEFT JOIN user_manager sm ON (
              (sm.id = mm.sender_user_manager_id)
              AND (sm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles sc ON (
              (sc.user_manager_id = sm.id)
              AND (sc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager rm ON (
              (rm.id = mm.recipient_user_manager_id)
              AND (rm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles rc ON (
              (rc.user_manager_id = rm.id)
              AND (rc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_contacts
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_contacts`;
CREATE VIEW `view_message_contacts` AS
SELECT um.id AS id,
       um.username AS um_username,
       um.status AS um_status,
       uc.name AS uc_name,
       uc.phone AS uc_phone,
       regexp_replace(coalesce(uc.phone,''),'[^0-9]','') AS phone_digits,
       um.created_at AS created_at,
       um.updated_at AS updated_at,
       um.deleted_at AS deleted_at
FROM user_manager um
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_group_chat_summary
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_chat_summary`;
CREATE VIEW `view_message_group_chat_summary` AS
SELECT ((gm.user_manager_id * 4294967296) + gm.message_groups_manager_id) AS id,
       gm.user_manager_id AS mgcs_member_user_manager_id,
       gm.message_groups_manager_id AS mgcs_group_id,
       g.name AS mg_name,
       g.status AS mg_status,
       (
              SELECT count(0)
              FROM message_group_members x
              WHERE ((x.message_groups_manager_id = g.id) AND (x.status = 'active') AND (x.deleted_at IS NULL))
       ) AS members_count,
       (
              SELECT count(0)
              FROM message_group_messages l
                     JOIN messages_manager m ON (
                            (m.id = l.messages_manager_id)
                            AND (m.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = g.id) AND (l.deleted_at IS NULL) AND (m.status = 'sent') AND (m.sender_user_manager_id <> gm.user_manager_id) AND (m.sent_at >= gm.created_at) AND EXISTS(SELECT 1 FROM message_group_reads r WHERE ((r.messages_manager_id = m.id) AND (r.user_manager_id = gm.user_manager_id) AND (r.deleted_at IS NULL))) is false)
       ) AS mgcs_unread_count,
       (
              SELECT m.id
              FROM message_group_messages l
                     JOIN messages_manager m ON (
                            (m.id = l.messages_manager_id)
                            AND (m.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = g.id) AND (l.deleted_at IS NULL) AND (m.status = 'sent')) ORDER BY m.sent_at DESC,m.id DESC LIMIT 1
       ) AS mgcs_last_message_id,
       (
              SELECT m.content
              FROM message_group_messages l
                     JOIN messages_manager m ON (
                            (m.id = l.messages_manager_id)
                            AND (m.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = g.id) AND (l.deleted_at IS NULL) AND (m.status = 'sent')) ORDER BY m.sent_at DESC,m.id DESC LIMIT 1
       ) AS mgcs_last_content,
       (
              SELECT m.sender_user_manager_id
              FROM message_group_messages l
                     JOIN messages_manager m ON (
                            (m.id = l.messages_manager_id)
                            AND (m.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = g.id) AND (l.deleted_at IS NULL) AND (m.status = 'sent')) ORDER BY m.sent_at DESC,m.id DESC LIMIT 1
       ) AS mgcs_last_sender_user_manager_id,
       (
              SELECT m.sent_at
              FROM message_group_messages l
                     JOIN messages_manager m ON (
                            (m.id = l.messages_manager_id)
                            AND (m.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = g.id) AND (l.deleted_at IS NULL) AND (m.status = 'sent')) ORDER BY m.sent_at DESC,m.id DESC LIMIT 1
       ) AS mgcs_last_message_at,
       gm.created_at AS created_at,
       gm.updated_at AS updated_at,
       NULL AS deleted_at
FROM message_group_members gm
       JOIN message_groups_manager g ON (
              (g.id = gm.message_groups_manager_id)
              AND (g.deleted_at IS NULL)
       )
WHERE ((gm.status = 'active') AND (gm.deleted_at IS NULL));
-- -----------------------------------------------------------------------------
-- view_message_group_members
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
              (mg.id = mgm.message_groups_manager_id)
              AND (mg.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = mgm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_group_memberships
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_memberships`;
CREATE VIEW `view_message_group_memberships` AS
SELECT mg.id AS id,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       mg.name AS mg_name,
       mg.description AS mg_description,
       mg.status AS mg_status,
       um.username AS um_username,
       uc.name AS uc_name,
       (
              SELECT count(0)
              FROM message_group_members m
              WHERE ((m.message_groups_manager_id = mg.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_count,
       (
              SELECT (cast(left(group_concat(coalesce(pc.name,pu.username) ORDER BY coalesce(pc.name,pu.username) ASC separator ', '),500) AS char charset utf8mb4) collate utf8mb4_general_ci)
              FROM message_group_members m
                     JOIN user_manager pu ON (
                            (pu.id = m.user_manager_id)
                            AND (pu.deleted_at IS NULL)
                     )
                     LEFT JOIN user_profiles pc ON (
                            (pc.user_manager_id = pu.id)
                            AND (pc.deleted_at IS NULL)
                     )
              WHERE ((m.message_groups_manager_id = mg.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_names,
       mg.created_at AS created_at,
       mg.updated_at AS updated_at,
       mg.deleted_at AS deleted_at,
       (
              SELECT (cast(left(group_concat(concat_ws(' ',pc.name,pu.username,regexp_replace(coalesce(pc.phone,''),'[^0-9]','')) ORDER BY pc.name ASC separator ' | '),1000) AS char charset utf8mb4) collate utf8mb4_general_ci)
              FROM message_group_members m
                     JOIN user_manager pu ON (
                            (pu.id = m.user_manager_id)
                            AND (pu.deleted_at IS NULL)
                     )
                     LEFT JOIN user_profiles pc ON (
                            (pc.user_manager_id = pu.id)
                            AND (pc.deleted_at IS NULL)
                     )
              WHERE ((m.message_groups_manager_id = mg.id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_search
FROM message_groups_manager mg
       LEFT JOIN user_manager um ON (
              (um.id = mg.owner_user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_group_messages
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
              (mm.id = mgl.messages_manager_id)
              AND (mm.deleted_at IS NULL)
       )
       LEFT JOIN message_groups_manager mg ON (
              (mg.id = mgl.message_groups_manager_id)
              AND (mg.deleted_at IS NULL)
       )
       LEFT JOIN user_manager sm ON (
              (sm.id = mm.sender_user_manager_id)
              AND (sm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles sc ON (
              (sc.user_manager_id = sm.id)
              AND (sc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_group_posts
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_posts`;
CREATE VIEW `view_message_group_posts` AS
SELECT mgl.id AS id,
       mgl.messages_manager_id AS mgl_messages_manager_id,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.scheduled_at AS mm_scheduled_at,
       mm.sent_at AS mm_sent_at,
       mg.name AS mg_name,
       mg.status AS mg_status,
       mg.owner_user_manager_id AS mg_owner_user_manager_id,
       sm.username AS sm_username,
       sc.name AS sc_name,
       (
              SELECT count(0)
              FROM message_group_members m
              WHERE ((m.message_groups_manager_id = mgl.message_groups_manager_id) AND (m.status = 'active') AND (m.deleted_at IS NULL))
       ) AS members_count,
       mgl.created_at AS created_at,
       mgl.updated_at AS updated_at,
       mgl.deleted_at AS deleted_at,
       (
              SELECT count(0)
              FROM message_attachments ma
              WHERE ((ma.messages_manager_id = mgl.messages_manager_id) AND (ma.deleted_at IS NULL))
       ) AS attachments_count
FROM message_group_messages mgl
       LEFT JOIN messages_manager mm ON (
              mm.id = mgl.messages_manager_id
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgl.message_groups_manager_id
       )
       LEFT JOIN user_manager sm ON (
              sm.id = mm.sender_user_manager_id
       )
       LEFT JOIN user_profiles sc ON (
              (sc.user_manager_id = sm.id)
              AND (sc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_group_reads
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_group_reads`;
CREATE VIEW `view_message_group_reads` AS
SELECT r.id AS id,
       r.messages_manager_id AS mgr_messages_manager_id,
       r.user_manager_id AS mgr_user_manager_id,
       r.read_at AS mgr_read_at,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.sent_at AS mm_sent_at,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mg.name AS mg_name,
       um.username AS um_username,
       uc.name AS uc_name,
       r.created_at AS created_at,
       r.updated_at AS updated_at,
       r.deleted_at AS deleted_at
FROM message_group_reads r
       JOIN messages_manager mm ON (
              mm.id = r.messages_manager_id
       )
       LEFT JOIN message_group_messages mgl ON (
              (mgl.messages_manager_id = mm.id)
              AND (mgl.deleted_at IS NULL)
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgl.message_groups_manager_id
       )
       LEFT JOIN user_manager um ON (
              um.id = r.user_manager_id
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_groups_manager
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
              SELECT count(0)
              FROM message_group_members m
              WHERE ((m.message_groups_manager_id = mg.id) AND (m.deleted_at IS NULL) AND (m.status = 'active'))
       ) AS members_count,
       (
              SELECT count(0)
              FROM message_group_messages l
                     JOIN messages_manager x ON (
                            (x.id = l.messages_manager_id)
                            AND (x.deleted_at IS NULL)
                     )
              WHERE ((l.message_groups_manager_id = mg.id) AND (l.deleted_at IS NULL))
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
              (um.id = mg.owner_user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_mentions
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_mentions`;
CREATE VIEW `view_message_mentions` AS
SELECT mt.id AS id,
       mt.messages_manager_id AS mmt_messages_manager_id,
       mt.user_manager_id AS mmt_user_manager_id,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mm.sender_user_manager_id AS mm_sender_user_manager_id,
       mm.sent_at AS mm_sent_at,
       mgl.message_groups_manager_id AS mgl_message_groups_manager_id,
       mg.name AS mg_name,
       um.username AS um_username,
       uc.name AS uc_name,
       sm.username AS sm_username,
       sc.name AS sc_name,
       mt.created_at AS created_at,
       mt.updated_at AS updated_at,
       mt.deleted_at AS deleted_at
FROM message_mentions mt
       JOIN messages_manager mm ON (
              mm.id = mt.messages_manager_id
       )
       LEFT JOIN message_group_messages mgl ON (
              (mgl.messages_manager_id = mm.id)
              AND (mgl.deleted_at IS NULL)
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = mgl.message_groups_manager_id
       )
       LEFT JOIN user_manager um ON (
              um.id = mt.user_manager_id
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager sm ON (
              sm.id = mm.sender_user_manager_id
       )
       LEFT JOIN user_profiles sc ON (
              (sc.user_manager_id = sm.id)
              AND (sc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_users_groups
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_users_groups`;
CREATE VIEW `view_message_users_groups` AS
SELECT um.id AS id,
       cmx.company_id AS company_id,
       um.username AS um_username,
       um.status AS um_status,
       uc.name AS uc_name,
       uc.email AS uc_email,
       (
              SELECT count(0)
              FROM message_group_members m
                     JOIN message_groups_manager g ON (
                            (g.id = m.message_groups_manager_id)
                            AND (g.deleted_at IS NULL)
                     )
              WHERE ((m.user_manager_id = um.id) AND (m.status = 'active') AND (m.deleted_at IS NULL) AND (g.company_id = cmx.company_id))
       ) AS groups_count,
       (
              SELECT left(group_concat(g.name ORDER BY g.name ASC separator ', '),500)
              FROM message_group_members m
                     JOIN message_groups_manager g ON (
                            (g.id = m.message_groups_manager_id)
                            AND (g.deleted_at IS NULL)
                     )
              WHERE ((m.user_manager_id = um.id) AND (m.status = 'active') AND (m.deleted_at IS NULL) AND (g.company_id = cmx.company_id))
       ) AS groups_names,
       um.created_at AS created_at,
       um.updated_at AS updated_at,
       um.deleted_at AS deleted_at
FROM user_manager um
       JOIN company_members cmx ON (
              (cmx.user_manager_id = um.id)
              AND (cmx.status = 'active')
              AND (cmx.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_message_warnings
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_message_warnings`;
CREATE VIEW `view_message_warnings` AS
SELECT w.id AS id,
       w.messages_manager_id AS mw_messages_manager_id,
       w.user_manager_id AS mw_user_manager_id,
       w.message_groups_manager_id AS mw_message_groups_manager_id,
       w.flagged_word AS mw_flagged_word,
       mm.content AS mm_content,
       mm.status AS mm_status,
       mg.name AS mg_name,
       um.username AS um_username,
       uc.name AS uc_name,
       w.created_at AS created_at,
       w.updated_at AS updated_at,
       w.deleted_at AS deleted_at
FROM message_warnings w
       JOIN messages_manager mm ON (
              mm.id = w.messages_manager_id
       )
       LEFT JOIN message_groups_manager mg ON (
              mg.id = w.message_groups_manager_id
       )
       LEFT JOIN user_manager um ON (
              um.id = w.user_manager_id
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_messages_manager
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
              (sm.id = mm.sender_user_manager_id)
              AND (sm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles sc ON (
              (sc.user_manager_id = sm.id)
              AND (sc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager rm ON (
              (rm.id = mm.recipient_user_manager_id)
              AND (rm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles rc ON (
              (rc.user_manager_id = rm.id)
              AND (rc.deleted_at IS NULL)
       )
       LEFT JOIN message_group_messages mgl ON (
              (mgl.messages_manager_id = mm.id)
              AND (mgl.deleted_at IS NULL)
       )
       LEFT JOIN message_groups_manager mg ON (
              (mg.id = mgl.message_groups_manager_id)
              AND (mg.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_messages_users
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_messages_users`;
CREATE VIEW `view_messages_users` AS
SELECT cast(((agg.owner_id * 4294967296) + agg.peer_id) AS unsigned) AS id,
       agg.company_id AS company_id,
       agg.owner_id AS mu_owner_user_manager_id,
       agg.peer_id AS mu_peer_user_manager_id,
       agg.messages_count AS mu_messages_count,
       agg.unread_count AS mu_unread_count,
       lm.id AS mu_last_message_id,
       lm.content AS mu_last_content,
       lm.status AS mu_last_status,
       lm.sender_user_manager_id AS mu_last_sender_user_manager_id,
       coalesce(lm.sent_at,lm.created_at) AS mu_last_message_at,
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
       coalesce(lm.sent_at,lm.created_at) AS updated_at,
       NULL AS deleted_at
FROM (SELECT p.owner_id AS owner_id,p.peer_id AS peer_id,max(p.message_id) AS last_id,count(0) AS messages_count,sum(((p.received = 1) AND (p.read_at IS NULL))) AS unread_count,min(p.created_at) AS first_at,p.company_id AS company_id FROM (SELECT messages_manager.sender_user_manager_id AS owner_id,messages_manager.recipient_user_manager_id AS peer_id,messages_manager.id AS message_id,messages_manager.created_at AS created_at,messages_manager.read_at AS read_at,0 AS received,messages_manager.company_id AS company_id FROM messages_manager WHERE ((messages_manager.deleted_at IS NULL) AND (messages_manager.recipient_user_manager_id IS NOT NULL) AND (messages_manager.status IN ('scheduled','sent'))) union all SELECT messages_manager.recipient_user_manager_id AS recipient_user_manager_id,messages_manager.sender_user_manager_id AS sender_user_manager_id,messages_manager.id AS id,messages_manager.created_at AS created_at,messages_manager.read_at AS read_at,1 AS `1`,messages_manager.company_id AS company_id FROM messages_manager WHERE ((messages_manager.deleted_at IS NULL) AND (messages_manager.recipient_user_manager_id IS NOT NULL) AND (messages_manager.status = 'sent'))) p GROUP BY p.owner_id,p.peer_id,p.company_id) agg
       JOIN messages_manager lm ON (
              lm.id = agg.last_id
       )
       LEFT JOIN user_manager om ON (
              (om.id = agg.owner_id)
              AND (om.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles oc ON (
              (oc.user_manager_id = om.id)
              AND (oc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager pm ON (
              (pm.id = agg.peer_id)
              AND (pm.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles pc ON (
              (pc.user_manager_id = pm.id)
              AND (pc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_nav_manager
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
-- view_timeline_manager
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
              (um.id = tm.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_attachments
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
              (tp.id = ta.timeline_post_id)
              AND (tp.deleted_at IS NULL)
       )
       LEFT JOIN user_manager um ON (
              (um.id = tp.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_comments
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
              (um.id = tc.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN timeline_posts tp ON (
              (tp.id = tc.timeline_post_id)
              AND (tp.deleted_at IS NULL)
       )
       LEFT JOIN timeline_post_comments pc ON (
              (pc.id = tc.parent_id)
              AND (pc.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_ratings
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
              (um.id = rt.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN timeline_posts tp ON (
              (tp.id = rt.timeline_post_id)
              AND (tp.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_reactions
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
              (um.id = tr.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN timeline_posts tp ON (
              (tp.id = tr.timeline_post_id)
              AND (tp.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_post_reports
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
              (um.id = trp.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN user_manager mu ON (
              (mu.id = trp.reviewed_by)
              AND (mu.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles muc ON (
              (muc.user_manager_id = mu.id)
              AND (muc.deleted_at IS NULL)
       )
       LEFT JOIN timeline_posts tp ON (
              (tp.id = trp.timeline_post_id)
              AND (tp.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_timeline_posts
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
              SELECT count(0)
              FROM timeline_post_comments c
              WHERE ((c.timeline_post_id = tp.id) AND (c.deleted_at IS NULL) AND (c.status = 'published'))
       ) AS comments_count,
       (
              SELECT count(0)
              FROM timeline_post_reactions lr
              WHERE ((lr.timeline_post_id = tp.id) AND (lr.deleted_at IS NULL) AND (lr.reaction_type = 'LIKE'))
       ) AS likes_count,
       (
              SELECT count(0)
              FROM timeline_post_reactions dr
              WHERE ((dr.timeline_post_id = tp.id) AND (dr.deleted_at IS NULL) AND (dr.reaction_type = 'dislike'))
       ) AS dislikes_count,
       (
              SELECT count(0)
              FROM timeline_post_ratings rt
              WHERE ((rt.timeline_post_id = tp.id) AND (rt.deleted_at IS NULL))
       ) AS ratings_count,
       (
              SELECT round(avg(rt2.rating),2)
              FROM timeline_post_ratings rt2
              WHERE ((rt2.timeline_post_id = tp.id) AND (rt2.deleted_at IS NULL))
       ) AS ratings_avg,
       (
              SELECT count(0)
              FROM timeline_posts rp2
              WHERE ((rp2.repost_of_id = tp.id) AND (rp2.deleted_at IS NULL))
       ) AS reposts_count,
       (
              SELECT count(0)
              FROM timeline_post_attachments at
              WHERE ((at.timeline_post_id = tp.id) AND (at.deleted_at IS NULL) AND (at.status = 'active'))
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
              (tm.id = tp.timeline_manager_id)
              AND (tm.deleted_at IS NULL)
       )
       JOIN user_manager um ON (
              (um.id = tp.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN timeline_posts rp ON (
              (rp.id = tp.repost_of_id)
              AND (rp.deleted_at IS NULL)
       )
       LEFT JOIN user_manager ru ON (
              (ru.id = rp.user_manager_id)
              AND (ru.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles rc ON (
              (rc.user_manager_id = ru.id)
              AND (rc.deleted_at IS NULL)
       )
WHERE (tp.deleted_at IS NULL);
-- -----------------------------------------------------------------------------
-- view_upload_manager
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
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
WHERE (um.deleted_at IS NULL);
-- -----------------------------------------------------------------------------
-- view_user_manager
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_manager`;
CREATE VIEW `view_user_manager` AS
SELECT um.id AS id,
       cmx.company_id AS company_id,
       cmx.status AS cm_status,
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
       JOIN company_members cmx ON (
              (cmx.user_manager_id = um.id)
              AND (cmx.status IN ('pending','active','blocked'))
              AND (cmx.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN user_roles ur ON (
              (ur.id = um.user_role_id)
              AND (ur.deleted_at IS NULL)
       );
-- -----------------------------------------------------------------------------
-- view_user_resource_access
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `view_user_resource_access`;
CREATE VIEW `view_user_resource_access` AS
SELECT ura.id AS id,
       ura.user_manager_id AS ura_user_manager_id,
       ura.resource_type AS ura_resource_type,
       ura.resource_id AS ura_resource_id,
       ura.allowed AS ura_allowed,
       (CASE ura.allowed WHEN 1 THEN 'Permitido' ELSE 'Negado' END) AS access_label,
       (CASE ura.resource_type WHEN 'form' THEN 'Formulário' ELSE 'Listagem' END) AS resource_type_label,
       (CASE ura.resource_type WHEN 'form' THEN fm.slug ELSE lm.slug END) AS resource_slug,
       (CASE ura.resource_type WHEN 'form' THEN fm.title ELSE lm.title END) AS resource_title,
       um.username AS um_username,
       uc.name AS uc_name,
       uc.email AS uc_email,
       ura.created_at AS created_at,
       ura.updated_at AS updated_at,
       ura.deleted_at AS deleted_at
FROM user_resource_access ura
       LEFT JOIN user_manager um ON (
              (um.id = ura.user_manager_id)
              AND (um.deleted_at IS NULL)
       )
       LEFT JOIN user_profiles uc ON (
              (uc.user_manager_id = um.id)
              AND (uc.deleted_at IS NULL)
       )
       LEFT JOIN form_manager fm ON (
              (ura.resource_type = 'form')
              AND (fm.id = ura.resource_id)
       )
       LEFT JOIN list_manager lm ON (
              (ura.resource_type = 'list')
              AND (lm.id = ura.resource_id)
       );
/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */
;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET NAMES @OLD_NAMES */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;
