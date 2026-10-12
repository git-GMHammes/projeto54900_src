<?php

namespace App\Models\V1\Map\MapRoutes;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_routes — trajetos calculados (OpenRouteService).
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_routes for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_routes';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_routes';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mr_name', 'mm_title'];

    protected array $sortableFields = [
        'id', 'mr_map_manager_id', 'mr_name', 'mr_profile', 'mr_distance_m', 'mr_duration_s', 'mr_status', 'mm_title', 'stops_count', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mr_name', 'mm_title'];

    public array $filterFields = ['mr_map_manager_id', 'mr_profile', 'mr_status', 'mr_user_manager_id'];
}
