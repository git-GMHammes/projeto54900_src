<?php

namespace App\Models\V1\Sgd\DocumentTypes;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela sgd_document_types — tipos de documento do SGD (slug + name).
 * Consumida pelo select "Tipo do documento" do formulario criar-sgd (valor slug, texto name).
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'sgd_document_types';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'slug',
        'name',
        'sort_order',
        'status',
    ];

    protected array $likeFields = ['slug', 'name'];

    protected array $sortableFields = [
        'id',
        'slug',
        'name',
        'sort_order',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = ['slug', 'name'];
}
