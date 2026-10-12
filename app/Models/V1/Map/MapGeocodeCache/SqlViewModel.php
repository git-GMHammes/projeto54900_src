<?php

namespace App\Models\V1\Map\MapGeocodeCache;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_geocode_cache — cache de geocodificacao (politica do Nominatim exige cache).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_geocode_cache';
    protected $primaryKey = 'id';

    protected array $likeFields = ['query_text'];

    protected array $sortableFields = [
        'id', 'query_text', 'provider', 'expires_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['query_text'];

    public array $filterFields = ['provider'];
}
