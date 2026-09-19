<?php

namespace App\Models\V1\Calendar\CalendarEvents;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_events.
 *
 * Tabela: calendar_events
 * DDL (resumo): id (BIGINT PK auto),
 *   calendar_id (BIGINT NOT NULL, FK -> calendar_manager.id, CASCADE),
 *   google_event_id (VARCHAR(512) NULL, unico), ical_uid (VARCHAR(255) NULL),
 *   status (ENUM confirmed/tentative/cancelled, default confirmed),
 *   summary (VARCHAR(255) NOT NULL), description (TEXT NULL),
 *   location (VARCHAR(255) NULL),
 *   start_date (DATE NULL), start_datetime (DATETIME NULL),
 *   start_time_zone (VARCHAR(50) NULL),
 *   end_date (DATE NULL), end_datetime (DATETIME NULL),
 *   end_time_zone (VARCHAR(50) NULL),
 *   recurrence (TEXT NULL),
 *   recurring_event_id (BIGINT NULL, FK -> calendar_events.id, SET NULL),
 *   sequence (INT default 0),
 *   transparency (ENUM opaque/transparent, default opaque),
 *   visibility (ENUM default/public/private/confidential, default default),
 *   color_id (VARCHAR(10) NULL),
 *   event_type (ENUM default/outOfOffice/focusTime/workingLocation/birthday, default default),
 *   guests_can_modify (TINYINT(1) default 0),
 *   guests_can_invite_others (TINYINT(1) default 1),
 *   guests_can_see_other_guests (TINYINT(1) default 1),
 *   anyone_can_add_self (TINYINT(1) default 0),
 *   html_link (VARCHAR(500) NULL),
 *   google_created_at (DATETIME NULL), google_updated_at (DATETIME NULL),
 *   created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_events';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'calendar_id',
        'google_event_id',
        'ical_uid',
        'status',
        'summary',
        'description',
        'location',
        'start_date',
        'start_datetime',
        'start_time_zone',
        'end_date',
        'end_datetime',
        'end_time_zone',
        'recurrence',
        'recurring_event_id',
        'sequence',
        'transparency',
        'visibility',
        'color_id',
        'event_type',
        'guests_can_modify',
        'guests_can_invite_others',
        'guests_can_see_other_guests',
        'anyone_can_add_self',
        'html_link',
        'google_created_at',
        'google_updated_at',
    ];

    protected array $likeFields = [
        'summary',
        'location',
    ];

    protected array $sortableFields = [
        'id',
        'calendar_id',
        'status',
        'summary',
        'start_date',
        'start_datetime',
        'end_date',
        'end_datetime',
        'event_type',
        'sequence',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'summary',
        'description',
        'location',
    ];

    /**
     * Alias semantico para existsByField aplicado ao campo 'google_event_id'
     * (unicidade global, ignorando soft-deletes).
     */
    public function existsByGoogleEventId(string $googleEventId, ?int $excludeId = null): bool
    {
        return $this->existsByField('google_event_id', $googleEventId, $excludeId);
    }
}
