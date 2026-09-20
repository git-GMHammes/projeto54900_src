<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * View view_calendar_manager: calendar_manager (cm) LEFT JOIN calendar_events
 * (ce) — 2 niveis, decisao explicita do usuario em 2026-09-20 para evitar
 * produto cartesiano com os 4 ramos-filhos de calendar_events (attendees,
 * reminders, attachments, extended_properties), que ficam FORA desta view.
 *
 * Mesmo padrao SQL cru de CreateViewFormManagerMigration.php: colunas
 * prefixadas por tabela de origem, `id` e os timestamps expostos vem do nivel
 * mais profundo do JOIN (ce, o evento) e do nivel raiz (cm), respectivamente —
 * um calendario sem eventos ainda aparece (LEFT JOIN), com todo ce_* NULL.
 */
class CreateViewCalendarManagerMigration extends Migration
{
    public function up()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');

        $this->db->query(<<<'SQL'
            CREATE VIEW `view_calendar_manager` AS
            SELECT
                ce.id                          AS id,

                cm.id                          AS cm_id,
                cm.google_calendar_id          AS cm_google_calendar_id,
                cm.summary                     AS cm_summary,
                cm.description                 AS cm_description,
                cm.time_zone                   AS cm_time_zone,
                cm.location                    AS cm_location,
                cm.background_color            AS cm_background_color,
                cm.foreground_color            AS cm_foreground_color,
                cm.access_role                 AS cm_access_role,
                cm.is_primary                  AS cm_is_primary,
                cm.status                      AS cm_status,
                cm.user_manager_id             AS cm_user_manager_id,
                cm.document_manager_id         AS cm_document_manager_id,
                cm.map_manager_id              AS cm_map_manager_id,
                cm.networking_manager_id       AS cm_networking_manager_id,

                ce.id                          AS ce_id,
                ce.calendar_id                 AS ce_calendar_id,
                ce.google_event_id             AS ce_google_event_id,
                ce.ical_uid                    AS ce_ical_uid,
                ce.status                      AS ce_status,
                ce.summary                     AS ce_summary,
                ce.description                 AS ce_description,
                ce.location                    AS ce_location,
                ce.start_date                  AS ce_start_date,
                ce.start_datetime              AS ce_start_datetime,
                ce.start_time_zone             AS ce_start_time_zone,
                ce.end_date                    AS ce_end_date,
                ce.end_datetime                AS ce_end_datetime,
                ce.end_time_zone               AS ce_end_time_zone,
                ce.recurrence                  AS ce_recurrence,
                ce.recurring_event_id          AS ce_recurring_event_id,
                ce.sequence                    AS ce_sequence,
                ce.transparency                AS ce_transparency,
                ce.visibility                  AS ce_visibility,
                ce.color_id                    AS ce_color_id,
                ce.event_type                  AS ce_event_type,
                ce.guests_can_modify           AS ce_guests_can_modify,
                ce.guests_can_invite_others    AS ce_guests_can_invite_others,
                ce.guests_can_see_other_guests AS ce_guests_can_see_other_guests,
                ce.anyone_can_add_self         AS ce_anyone_can_add_self,
                ce.html_link                   AS ce_html_link,
                ce.google_created_at           AS ce_google_created_at,
                ce.google_updated_at           AS ce_google_updated_at,

                cm.created_at                  AS created_at,
                cm.updated_at                  AS updated_at,
                cm.deleted_at                  AS deleted_at
            FROM `calendar_manager` cm
            LEFT JOIN `calendar_events` ce
                ON ce.calendar_id = cm.id
               AND ce.deleted_at IS NULL
            WHERE cm.deleted_at IS NULL
            SQL);
    }

    public function down()
    {
        $this->db->query('DROP VIEW IF EXISTS `view_calendar_manager`');
    }
}
