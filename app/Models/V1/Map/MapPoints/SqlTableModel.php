<?php

namespace App\Models\V1\Map\MapPoints;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_points — pontos no mapa.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_points';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'map_manager_id',
        'map_category_id',
        'map_icon_id',
        'map_address_id',
        'user_manager_id',
        'name',
        'description',
        'lat',
        'lng',
        'extra_json',
        'status',
    ];

    protected array $likeFields = ['name', 'description'];

    protected array $sortableFields = [
        'id', 'map_manager_id', 'map_category_id', 'map_icon_id', 'map_address_id', 'user_manager_id', 'name', 'lat', 'lng', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name'];
}
