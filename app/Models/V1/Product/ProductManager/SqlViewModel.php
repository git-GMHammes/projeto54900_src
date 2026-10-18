<?php

namespace App\Models\V1\Product\ProductManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_product_manager — produto com pai, local (caminho completo) e contadores de filhos e atributos.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de product_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'product_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_product_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['code', 'name', 'type', 'parent_name', 'location_name', 'location_path_names'];

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
        'children_count',
        'attributes_count',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'name', 'type', 'description', 'location_path_names'];

    public array $filterFields = ['parent_id', 'location_id', 'type', 'status'];
}
