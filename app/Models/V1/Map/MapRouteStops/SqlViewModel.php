<?php

namespace App\Models\V1\Map\MapRouteStops;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_route_stops — paradas do trajeto, com distancia e tempo do trecho.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_route_stops for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_route_stops';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_route_stops';
    protected $primaryKey = 'id';

    protected array $likeFields = ['rs_label', 'mr_name', 'pt_name', 'ma_display_name'];

    protected array $sortableFields = [
        'id', 'rs_map_route_id', 'rs_sort_order', 'rs_label', 'rs_eta', 'mr_name', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['rs_label', 'mr_name', 'pt_name', 'ma_display_name'];

    public array $filterFields = ['rs_map_route_id', 'rs_map_point_id'];
}
