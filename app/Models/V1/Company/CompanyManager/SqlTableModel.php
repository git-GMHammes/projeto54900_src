<?php

namespace App\Models\V1\Company\CompanyManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela company_manager (cadastro de empresas).
 *
 * DDL: id (BIGINT PK auto), name, slug (UNIQUE), document (nullable, CNPJ),
 *      status (ENUM active/inactive, default active),
 *      created_at, updated_at, deleted_at.
 * A empresa id=1 (slug 'default') e a empresa padrao do ambiente de desenvolvimento.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so a empresa da sessao (id = empresa da sessao). */
    protected string $companyScope = 'self';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'company_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'name',
        'slug',
        'document',
        'status',
    ];

    protected array $likeFields = ['name', 'slug', 'document'];

    protected array $sortableFields = [
        'id', 'name', 'slug', 'document', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'slug', 'document'];
}
