<?php

namespace App\Models\V1\Service\ServiceManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_service_manager — servico com pai e contadores de filhos, atributos e pedidos abertos.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de service_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'service_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_service_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['code', 'name', 'type', 'parent_name'];

    protected array $sortableFields = [
        'id',
        'parent_id',
        'code',
        'name',
        'type',
        'provider_type',
        'billing_unit',
        'price',
        'duration',
        'lead_time',
        'status',
        'children_count',
        'attributes_count',
        'open_orders_count',
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'name', 'type', 'description', 'parent_name'];

    public array $filterFields = ['parent_id', 'type', 'provider_type', 'billing_unit', 'status'];
}
