<?php

namespace App\Models\V1\Map\MapIcons;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela map_icons — icones de marcacao geografica (Bootstrap Icon, imagem ou SVG).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'map_icons';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'name',
        'icon_type',
        'icon_class',
        'upload_id',
        'color',
        'size_w',
        'size_h',
        'anchor_x',
        'anchor_y',
        'status',
    ];

    protected array $likeFields = ['name', 'icon_class', 'color'];

    protected array $sortableFields = [
        'id', 'name', 'icon_type', 'icon_class', 'upload_id', 'color', 'size_w', 'size_h', 'anchor_x', 'anchor_y', 'status', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'icon_class', 'color'];
}
