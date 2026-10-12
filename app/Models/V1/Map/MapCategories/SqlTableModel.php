<?php

namespace App\Models\V1\Map\MapCategories;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_categories — categoria de ponto, por mapa.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_categories';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'map_manager_id',
        'map_icon_id',
        'name',
        'slug',
        'color',
        'sort_order',
        'status',
    ];

    protected array $likeFields = ['name', 'slug', 'color'];

    protected array $sortableFields = [
        'id', 'map_manager_id', 'map_icon_id', 'name', 'slug', 'color', 'sort_order', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'slug', 'color'];
}
