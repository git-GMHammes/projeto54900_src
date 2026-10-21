<?php

namespace App\Models\V1\Location\LocationTypes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela location_types — tipo (rotulo) de local. Global: compartilhada entre empresas.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'location_types';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'code',
        'name',
        'icon',
        'sort_order',
        'status',
    ];

    protected array $likeFields = ['code', 'name'];

    protected array $sortableFields = [
        'id', 'code', 'name', 'sort_order', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['code', 'name'];
}
