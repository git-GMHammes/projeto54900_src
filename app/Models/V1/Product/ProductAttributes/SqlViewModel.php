<?php

namespace App\Models\V1\Product\ProductAttributes;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_product_attributes — caracteristica com dados do produto.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de product_attributes for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'product_attributes';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_product_attributes';
    protected $primaryKey = 'id';

    protected array $likeFields = ['product_code', 'product_name', 'group_code', 'field_code', 'label', 'value'];

    protected array $sortableFields = [
        'id',
        'product_id',
        'product_code',
        'product_name',
        'group_code',
        'field_code',
        'label',
        'value',
        'unit',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['product_code', 'product_name', 'group_code', 'field_code', 'label', 'value'];

    public array $filterFields = ['product_id', 'group_code', 'field_code'];
}
