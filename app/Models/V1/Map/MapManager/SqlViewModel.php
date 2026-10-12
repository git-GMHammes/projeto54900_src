<?php

namespace App\Models\V1\Map\MapManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_manager — o mapa: centro, zoom e fonte de tiles.
 */
class SqlViewModel extends BaseViewModel
{
    /** Isolamento por empresa: a linha so aparece se o registro de map_manager for da empresa da sessao. */
    protected string $companyScope = 'via_table';
    protected string $companyViaTable = 'map_manager';

    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = ['slug', 'title', 'description'];

    protected array $sortableFields = [
        'id', 'user_manager_id', 'slug', 'title', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['slug', 'title', 'description'];

    public array $filterFields = ['status', 'user_manager_id'];
}
