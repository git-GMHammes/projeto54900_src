<?php

namespace App\Models\V1\Map\MapRouteStops;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_route_stops — paradas do trajeto, com distancia e tempo do trecho.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_route_stops';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'map_route_id',
        'map_point_id',
        'map_address_id',
        'label',
        'lat',
        'lng',
        'sort_order',
        'leg_distance_m',
        'leg_duration_s',
        'service_time_s',
        'eta',
    ];

    protected array $likeFields = ['label'];

    protected array $sortableFields = [
        'id', 'map_route_id', 'map_point_id', 'map_address_id', 'label', 'lat', 'lng', 'sort_order', 'leg_distance_m', 'leg_duration_s', 'service_time_s', 'eta', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['label'];
}
