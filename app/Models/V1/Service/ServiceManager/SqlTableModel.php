<?php

namespace App\Models\V1\Service\ServiceManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela service_manager — servico (arvore opcional por parent_id: pacote, obra, etapa).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'service_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'parent_id',
        'code',
        'name',
        'description',
        'type',
        'provider_type',
        'provider_document',
        'billing_unit',
        'price',
        'currency',
        'duration',
        'duration_unit',
        'lead_time',
        'lead_time_unit',
        'status',
        'sort_order',
        'roles',
    ];

    protected array $likeFields = ['code', 'name', 'description', 'type'];

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
        'sort_order',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['code', 'name', 'description', 'type'];
}
