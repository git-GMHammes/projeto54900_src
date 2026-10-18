<?php

namespace App\Models\V1\Movement\MovementStock;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_movement_stock — saldo por produto: entradas, saidas, desperdicios, saldo, reservado, encomendado, disponivel e alerta de abaixo do minimo.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de product_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'product_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_movement_stock';
    protected $primaryKey = 'id';

    protected array $likeFields = ['product_code', 'product_name'];

    protected array $sortableFields = [
        'id',
        'product_id',
        'product_code',
        'product_name',
        'stock_min',
        'stock_max',
        'entries',
        'exits',
        'wastes',
        'on_hand',
        'reserved',
        'ordered',
        'available',
        'below_min',
        'next_expected_at',
        'last_movement_at',
    ];

    public array $searchFields = ['product_code', 'product_name'];

    public array $filterFields = ['product_id', 'product_status', 'below_min'];
}
