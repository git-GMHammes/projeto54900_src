<?php

namespace App\Models\V1\Calendar\CalendarEventAttendees;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_event_attendees.
 *
 * Tabela: calendar_event_attendees
 * DDL: id (BIGINT PK auto),
 *      calendar_event_id (BIGINT NOT NULL, FK -> calendar_events.id, CASCADE),
 *      user_manager_id (BIGINT NULL, FK -> user_manager.id, SET NULL — obrigatorio no create;
 *                       NULL so apos excluir o usuario),
 *      email (VARCHAR(255) NOT NULL), display_name (VARCHAR(255) NULL),
 *      is_organizer / is_self / is_resource / is_optional (TINYINT(1) default 0),
 *      response_status (ENUM needsAction/declined/tentative/accepted, default needsAction),
 *      comment (TEXT NULL),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_event_attendees';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'calendar_event_id',
        'user_manager_id',
        'email',
        'display_name',
        'is_organizer',
        'is_self',
        'is_resource',
        'is_optional',
        'response_status',
        'comment',
    ];

    protected array $likeFields = [
        'email',
        'display_name',
    ];

    protected array $sortableFields = [
        'id',
        'calendar_event_id',
        'user_manager_id',
        'email',
        'display_name',
        'response_status',
        'is_organizer',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'email',
        'display_name',
        'comment',
    ];

    /**
     * Ja existe um participante com o mesmo email dentro do mesmo evento?
     * (unicidade escopada em calendar_event_id, ignorando soft-deletes).
     */
    public function existsByEmailInEvent(int $calendarEventId, string $email, ?int $excludeId = null): bool
    {
        $builder = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('email', $email)
            ->where($this->deletedField . ' IS NULL', null, false);

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }

    /**
     * O usuario ja e convidado deste evento? (unicidade escopada em
     * calendar_event_id, ignorando soft-deletes).
     */
    public function existsByUserInEvent(int $calendarEventId, int $userManagerId, ?int $excludeId = null): bool
    {
        $builder = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('user_manager_id', $userManagerId)
            ->where($this->deletedField . ' IS NULL', null, false);

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }

    /**
     * Linha de convite ativa do usuario informado neste evento, ou null.
     * Usado em PUT /respond/{calendar_event_id} — self-service (o proprio
     * convidado responde ao proprio convite, resolvido por CurrentUser::id(),
     * nunca por um id de attendee vindo do cliente).
     */
    public function findByUserInEvent(int $calendarEventId, int $userManagerId): ?array
    {
        $row = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('user_manager_id', $userManagerId)
            ->where($this->deletedField . ' IS NULL', null, false)
            ->get()
            ->getRowArray();

        return $row ?: null;
    }
}
