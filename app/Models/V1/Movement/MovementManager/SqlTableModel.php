<?php

namespace App\Models\V1\Movement\MovementManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela movement_manager — movimento de produto (entry, exit, reservation, waste, order).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'movement_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'product_id',
        'type',
        'quantity',
        'status',
        'occurred_at',
        'expected_at',
        'user_manager_id',
        'location_id',
        'origin_id',
        'lot',
        'expires_at',
        'unit_cost',
        'reason',
        'reference',
        'notes',
        'roles',
    ];

    protected array $likeFields = ['lot', 'reason', 'reference', 'notes'];

    protected array $sortableFields = [
        'id',
        'product_id',
        'type',
        'quantity',
        'status',
        'occurred_at',
        'expected_at',
        'user_manager_id',
        'location_id',
        'origin_id',
        'lot',
        'expires_at',
        'unit_cost',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['lot', 'reason', 'reference', 'notes'];
}
