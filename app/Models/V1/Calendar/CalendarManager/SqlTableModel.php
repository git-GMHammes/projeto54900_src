<?php

namespace App\Models\V1\Calendar\CalendarManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_manager (espelho do recurso Calendar da API do Google Calendar).
 *
 * Tabela: calendar_manager
 * DDL: id (BIGINT PK auto), google_calendar_id (VARCHAR(255) NULL, unico),
 *      summary (VARCHAR(255) NOT NULL), description (TEXT NULL),
 *      time_zone (VARCHAR(50) NOT NULL), location (VARCHAR(255) NULL),
 *      background_color (VARCHAR(7) NULL), foreground_color (VARCHAR(7) NULL),
 *      access_role (ENUM freeBusyReader/reader/writer/owner, default owner),
 *      is_primary (TINYINT(1) default 0),
 *      status (ENUM active/inactive, default active),
 *      user_manager_id (BIGINT NULL, FK -> user_manager.id ON DELETE SET NULL),
 *      document_manager_id (BIGINT NULL, sem FK ainda - modulo Document Manager nao existe),
 *      map_manager_id (BIGINT NULL, sem FK ainda - modulo Map nao existe),
 *      networking_manager_id (BIGINT NULL, sem FK ainda - modulo Networking nao existe),
 *      created_at, updated_at, deleted_at.
 *
 * As 4 colunas *_manager_id sao vinculos opcionais N-para-1 com outros
 * modulos do sistema (varios calendarios podem apontar para o mesmo
 * usuario/documento/mapa/mensagem) - ver migrations
 * AddModuleLinksToCalendarManagerTableMigration e
 * DropUniqueFromCalendarManagerLinkColumnsMigration.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_manager';
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
        'user_manager_id',
        'document_manager_id',
        'map_manager_id',
        'networking_manager_id',
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
        'user_manager_id',
        'document_manager_id',
        'map_manager_id',
        'networking_manager_id',
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

    /**
     * IDs dos calendarios que sao pai de ao menos uma tarefa (calendar_events)
     * em que o usuario consta como convidado (calendar_event_attendees). Usado
     * pelo perfil Guest em todos os endpoints de leitura: ele nao e dono do
     * calendario, mas precisa enxergar o calendario-pai das tarefas para as
     * quais foi convidado. Retornado pronto para uso em restrictToIds
     * (BaseTableModel::applyIdRestriction).
     */
    public function findGuestInvitedCalendarIds(int $userId): array
    {
        $rows = $this->db->table('calendar_events')
            ->select('calendar_events.calendar_id')
            ->join('calendar_event_attendees', 'calendar_event_attendees.calendar_event_id = calendar_events.id')
            ->where('calendar_event_attendees.user_manager_id', $userId)
            ->where('calendar_events.deleted_at IS NULL', null, false)
            ->where('calendar_event_attendees.deleted_at IS NULL', null, false)
            ->groupBy('calendar_events.calendar_id')
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['calendar_id'], $rows);
    }

    /**
     * Existe, no calendario informado, ao menos uma tarefa (calendar_events)
     * em que o usuario consta como convidado (calendar_event_attendees)?
     * Usado na checagem de visibilidade do perfil Guest em get/{id}.
     */
    public function hasInvitedEventForCalendar(int $calendarId, int $userId): bool
    {
        return $this->db->table('calendar_events')
            ->join('calendar_event_attendees', 'calendar_event_attendees.calendar_event_id = calendar_events.id')
            ->where('calendar_events.calendar_id', $calendarId)
            ->where('calendar_event_attendees.user_manager_id', $userId)
            ->where('calendar_events.deleted_at IS NULL', null, false)
            ->where('calendar_event_attendees.deleted_at IS NULL', null, false)
            ->countAllResults() > 0;
    }

    /**
     * IDs de todos os calendarios cujo dono e o usuario informado, independente
     * de estarem ativos ou soft-deleted (o filtro de soft-delete e feito pelo
     * metodo generico que consumir este resultado via restrictToIds — ver
     * BaseTableModel::applyIdRestriction). Usado pelo perfil User em todos os
     * endpoints de leitura/exclusao de calendar-manager.
     */
    public function findOwnerIds(int $userId): array
    {
        $rows = $this->db->table($this->table)
            ->select('id')
            ->where('user_manager_id', $userId)
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }
}
