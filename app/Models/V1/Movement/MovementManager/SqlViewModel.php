<?php

namespace App\Models\V1\Movement\MovementManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_movement_manager — movimento com produto, usuario e local (caminho completo).
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de movement_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'movement_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_movement_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['product_code', 'product_name', 'lot', 'reference', 'reason', 'user_name', 'user_username'];

    protected array $sortableFields = [
        'id',
        'product_id',
        'product_code',
        'product_name',
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

    public array $searchFields = ['product_code', 'product_name', 'lot', 'reference', 'reason', 'user_name', 'location_path_names'];

    public array $filterFields = ['product_id', 'type', 'status', 'user_manager_id', 'location_id', 'origin_id'];
}
