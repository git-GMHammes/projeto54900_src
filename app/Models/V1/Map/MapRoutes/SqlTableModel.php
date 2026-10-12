<?php

namespace App\Models\V1\Map\MapRoutes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_routes — trajetos calculados (OpenRouteService).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_routes';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'map_manager_id',
        'user_manager_id',
        'name',
        'profile',
        'distance_m',
        'duration_s',
        'geometry',
        'bbox',
        'provider',
        'options_json',
        'calculated_at',
        'status',
    ];

    protected array $likeFields = ['name', 'geometry', 'provider'];

    protected array $sortableFields = [
        'id', 'map_manager_id', 'user_manager_id', 'name', 'profile', 'distance_m', 'duration_s', 'provider', 'calculated_at', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'provider'];
}
