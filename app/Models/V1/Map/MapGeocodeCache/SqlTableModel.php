<?php

namespace App\Models\V1\Map\MapGeocodeCache;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_geocode_cache — cache de geocodificacao (politica do Nominatim exige cache).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_geocode_cache';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'query_hash',
        'query_text',
        'provider',
        'lat',
        'lng',
        'result_json',
        'expires_at',
    ];

    protected array $likeFields = ['query_text'];

    protected array $sortableFields = [
        'id', 'query_hash', 'query_text', 'provider', 'lat', 'lng', 'expires_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['query_text'];
}
