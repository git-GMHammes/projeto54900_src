<?php

namespace App\Models\V1\Agenda\CalendarEventReminders;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_event_reminders.
 *
 * Tabela: calendar_event_reminders
 * DDL: id (BIGINT PK auto),
 *      calendar_event_id (BIGINT NOT NULL, FK -> calendar_events.id, CASCADE),
 *      method (ENUM email/popup, default popup),
 *      minutes (INT NOT NULL),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_event_reminders';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'calendar_event_id',
        'method',
        'minutes',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id',
        'calendar_event_id',
        'method',
        'minutes',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'method',
    ];

    /**
     * Ja existe um lembrete com o mesmo (method, minutes) dentro do mesmo evento?
     * (unicidade escopada em calendar_event_id, ignorando soft-deletes).
     */
    public function existsByMethodMinutesInEvent(
        int $calendarEventId,
        string $method,
        int $minutes,
        ?int $excludeId = null
    ): bool {
        $builder = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('method', $method)
            ->where('minutes', $minutes)
            ->where($this->deletedField . ' IS NULL', null, false);

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
