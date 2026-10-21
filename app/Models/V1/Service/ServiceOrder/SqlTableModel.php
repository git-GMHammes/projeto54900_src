<?php

namespace App\Models\V1\Service\ServiceOrder;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela service_order — pedido de servico (orcamento, agenda, execucao, avaliacao).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'service_order';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'service_id',
        'parent_id',
        'code',
        'status',
        'customer_name',
        'customer_contact',
        'customer_document',
        'customer_user_id',
        'executor_user_id',
        'created_by',
        'place',
        'quantity',
        'billing_unit',
        'currency',
        'quoted_price',
        'final_price',
        'requested_at',
        'scheduled_at',
        'started_at',
        'finished_at',
        'deadline_at',
        'paid_at',
        'rating',
        'feedback',
        'cancel_reason',
        'notes',
        'roles',
    ];

    protected array $likeFields = ['code', 'customer_name', 'customer_contact', 'place', 'notes'];

    protected array $sortableFields = [
        'id',
        'service_id',
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
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'customer_name', 'customer_contact', 'place', 'notes'];
}
