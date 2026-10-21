<?php

namespace App\Models\V1\Service\ServiceOrder;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_service_order — pedido com servico, executor, cliente, prazo (is_late, days_to_deadline) e duracao.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de service_order for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'service_order';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_service_order';
    protected $primaryKey = 'id';

    protected array $likeFields = ['code', 'customer_name', 'service_code', 'service_name', 'executor_name', 'executor_username', 'place'];

    protected array $sortableFields = [
        'id',
        'service_id',
        'service_code',
        'service_name',
        'parent_id',
        'code',
        'status',
        'customer_name',
        'executor_user_id',
        'quantity',
        'quoted_price',
        'final_price',
        'requested_at',
        'scheduled_at',
        'started_at',
        'finished_at',
        'deadline_at',
        'paid_at',
        'rating',
        'days_to_deadline',
        'is_late',
        'duration_minutes',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'customer_name', 'customer_contact', 'service_code', 'service_name', 'executor_name', 'place'];

    public array $filterFields = ['service_id', 'parent_id', 'status', 'executor_user_id', 'customer_user_id', 'created_by', 'is_late', 'provider_type', 'service_type'];
}
