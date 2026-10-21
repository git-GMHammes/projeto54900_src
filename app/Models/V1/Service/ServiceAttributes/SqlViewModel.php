<?php

namespace App\Models\V1\Service\ServiceAttributes;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_service_attributes — caracteristica com dados do servico.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de service_attributes for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'service_attributes';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_service_attributes';
    protected $primaryKey = 'id';

    protected array $likeFields = ['service_code', 'service_name', 'group_code', 'field_code', 'label', 'value'];

    protected array $sortableFields = [
        'id',
        'service_id',
        'service_code',
        'service_name',
        'group_code',
        'field_code',
        'label',
        'value',
        'unit',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['service_code', 'service_name', 'group_code', 'field_code', 'label', 'value'];

    public array $filterFields = ['service_id', 'group_code', 'field_code'];
}
