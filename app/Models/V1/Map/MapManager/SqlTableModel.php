<?php

namespace App\Models\V1\Map\MapManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_manager — o mapa: centro, zoom e fonte de tiles.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga/grava linhas da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'user_manager_id',
        'slug',
        'title',
        'description',
        'center_lat',
        'center_lng',
        'zoom',
        'min_zoom',
        'max_zoom',
        'tile_url',
        'attribution',
        'roles',
        'status',
        'version',
    ];

    protected array $likeFields = ['slug', 'title', 'description', 'tile_url', 'attribution'];

    protected array $sortableFields = [
        'id', 'user_manager_id', 'slug', 'title', 'center_lat', 'center_lng', 'zoom', 'min_zoom', 'max_zoom', 'tile_url', 'attribution', 'status', 'version', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['slug', 'title', 'tile_url', 'attribution'];
}
