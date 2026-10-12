<?php

namespace App\Models\V1\Map\MapIcons;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_map_icons — icones de marcacao geografica (Bootstrap Icon, imagem ou SVG).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_map_icons';
    protected $primaryKey = 'id';

    protected array $likeFields = ['name', 'icon_class', 'color'];

    protected array $sortableFields = [
        'id', 'name', 'icon_type', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'icon_class'];

    public array $filterFields = ['icon_type', 'status'];
}
