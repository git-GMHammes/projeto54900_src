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
}
