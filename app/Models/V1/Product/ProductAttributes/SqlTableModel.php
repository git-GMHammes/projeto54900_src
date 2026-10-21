<?php

namespace App\Models\V1\Product\ProductAttributes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela product_attributes — caracteristica do produto (grupo -> campo).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'product_attributes';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'product_id',
        'group_code',
        'field_code',
        'label',
        'value',
        'unit',
        'sort_order',
    ];

    protected array $likeFields = ['group_code', 'field_code', 'label', 'value'];

    protected array $sortableFields = [
        'id',
        'product_id',
        'group_code',
        'field_code',
        'label',
        'value',
        'unit',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['group_code', 'field_code', 'label', 'value'];
}
