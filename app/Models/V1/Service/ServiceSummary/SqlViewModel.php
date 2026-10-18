<?php

namespace App\Models\V1\Service\ServiceSummary;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_service_summary — resumo por servico: pedidos (total, abertos, concluidos, cancelados, atrasados), faturado, nota media e duracao media.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de service_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'service_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_service_summary';
    protected $primaryKey = 'id';

    protected array $likeFields = ['service_code', 'service_name', 'service_type'];

    protected array $sortableFields = [
        'id',
        'service_id',
        'service_code',
        'service_name',
        'service_type',
        'provider_type',
        'orders_total',
        'orders_open',
        'orders_done',
        'orders_cancelled',
        'revenue',
        'revenue_paid',
        'avg_rating',
        'avg_duration_minutes',
        'orders_late',
        'last_order_at',
    ];

    public array $searchFields = ['service_code', 'service_name', 'service_type'];

    public array $filterFields = ['service_id', 'service_type', 'provider_type', 'service_status'];
}
