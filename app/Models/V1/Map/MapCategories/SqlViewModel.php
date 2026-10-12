<?php

namespace App\Models\V1\Map\MapCategories;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_categories — categoria de ponto, por mapa.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_categories for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_categories';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_categories';
    protected $primaryKey = 'id';

    protected array $likeFields = ['mc_name', 'mc_slug', 'mm_title'];

    protected array $sortableFields = [
        'id', 'mc_map_manager_id', 'mc_name', 'mc_slug', 'mc_sort_order', 'mc_status', 'mm_title', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['mc_name', 'mc_slug', 'mm_title'];

    public array $filterFields = ['mc_map_manager_id', 'mc_status'];
}
