<?php

namespace App\Models\V1\Service\ServiceAttributes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela service_attributes — caracteristica do servico (grupo -> campo).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'service_attributes';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'service_id',
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
        'service_id',
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
