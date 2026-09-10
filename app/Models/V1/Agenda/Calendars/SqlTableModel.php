<?php

namespace App\Models\V1\Agenda\Calendars;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendars (espelho de Calendar do Google Agenda).
 *
 * Tabela: calendars
 * DDL: id (BIGINT PK auto), google_calendar_id (VARCHAR(255) NULL, unico),
 *      summary (VARCHAR(255) NOT NULL), description (TEXT NULL),
 *      time_zone (VARCHAR(50) NOT NULL), location (VARCHAR(255) NULL),
 *      background_color (VARCHAR(7) NULL), foreground_color (VARCHAR(7) NULL),
 *      access_role (ENUM freeBusyReader/reader/writer/owner, default owner),
 *      is_primary (TINYINT(1) default 0),
 *      status (ENUM active/inactive, default active),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendars';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'google_calendar_id',
        'summary',
        'description',
        'time_zone',
        'location',
        'background_color',
        'foreground_color',
        'access_role',
        'is_primary',
        'status',
    ];

    protected array $likeFields = [
        'summary',
        'location',
    ];

    protected array $sortableFields = [
        'id',
        'summary',
        'time_zone',
        'access_role',
        'is_primary',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'summary',
        'description',
        'location',
    ];

    /**
     * Alias semantico para existsByField aplicado ao campo 'google_calendar_id'
     * (unicidade global, ignorando soft-deletes).
     */
    public function existsByGoogleCalendarId(string $googleCalendarId, ?int $excludeId = null): bool
    {
        return $this->existsByField('google_calendar_id', $googleCalendarId, $excludeId);
    }
}
