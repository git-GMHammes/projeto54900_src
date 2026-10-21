<?php

namespace App\Models\V1\Product\ProductManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela product_manager — produto (arvore opcional por parent_id: kit, conjunto, componente).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'product_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'parent_id',
        'location_id',
        'code',
        'name',
        'description',
        'type',
        'status',
        'stock_min',
        'stock_max',
        'sort_order',
        'roles',
    ];

    protected array $likeFields = ['code', 'name', 'description', 'type'];

    protected array $sortableFields = [
        'id',
        'parent_id',
        'location_id',
        'code',
        'name',
        'type',
        'status',
        'stock_min',
        'stock_max',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'name', 'description', 'type'];
}
