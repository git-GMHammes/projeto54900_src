<?php

namespace App\Models\V1\Company\CompanyManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_company_manager — empresa + contagem de usuarios vinculados
 * (user_manager.company_ids contem o id da empresa).
 *
 * Somente leitura.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: so a empresa da sessao (id = empresa da sessao). */
    protected string $companyScope = 'self';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_company_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['co_name', 'co_slug', 'co_document'];

    protected array $sortableFields = [
        'id', 'co_name', 'co_slug', 'co_document', 'co_status', 'users_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['co_name', 'co_slug', 'co_document'];

    public array $filterFields = ['co_status'];
}
