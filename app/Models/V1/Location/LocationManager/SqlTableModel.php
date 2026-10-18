<?php

namespace App\Models\V1\Location\LocationManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela location_manager — local hierarquico (arvore recursiva por parent_id).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'location_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'parent_id',
        'location_type_id',
        'name',
        'code',
        'description',
        'latitude',
        'longitude',
        'sort_order',
        'status',
    ];

    protected array $likeFields = ['name', 'code', 'description'];

    protected array $sortableFields = [
        'id', 'parent_id', 'location_type_id', 'name', 'code', 'latitude', 'longitude', 'sort_order', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'code', 'description'];
}
