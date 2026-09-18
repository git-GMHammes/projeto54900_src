<?php

namespace App\Models\V1\Calendar\CalendarEventExtendedProperties;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela calendar_event_extended_properties.
 *
 * Tabela: calendar_event_extended_properties
 * DDL: id (BIGINT PK auto),
 *      calendar_event_id (BIGINT NOT NULL, FK -> calendar_events.id, CASCADE),
 *      scope (ENUM private/shared, default private),
 *      property_key (VARCHAR(255) NOT NULL),
 *      property_value (VARCHAR(1024) NOT NULL),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'calendar_event_extended_properties';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'calendar_event_id',
        'scope',
        'property_key',
        'property_value',
    ];

    protected array $likeFields = [
        'property_key',
        'property_value',
    ];

    protected array $sortableFields = [
        'id',
        'calendar_event_id',
        'scope',
        'property_key',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'property_key',
        'property_value',
    ];

    /**
     * Ja existe uma propriedade com a mesma (scope, property_key) dentro do
     * mesmo evento? (unicidade escopada em calendar_event_id, ignorando
     * soft-deletes).
     */
    public function existsByKeyInEvent(
        int $calendarEventId,
        string $scope,
        string $propertyKey,
        ?int $excludeId = null
    ): bool {
        $builder = $this->db->table($this->table)
            ->where('calendar_event_id', $calendarEventId)
            ->where('scope', $scope)
            ->where('property_key', $propertyKey)
            ->where($this->deletedField . ' IS NULL', null, false);

        if ($excludeId !== null) {
            $builder->where($this->primaryKey . ' !=', $excludeId);
        }

        return $builder->countAllResults() > 0;
    }
}
