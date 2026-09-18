<?php

namespace App\Models\V1\List\ListColumns;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela list_columns.
 *
 * Tabela: list_columns (FK list_manager_id -> list_manager, CASCADE).
 * DDL: id (BIGINT PK auto), list_manager_id, sort_order (default 0),
 *      label, field_key, concat_json, format (default 'text'), cell_class,
 *      fallback (default '—'), sortable (TINYINT(1) default 0), sort_key,
 *      sort_concat_json, visible (TINYINT(1) default 1),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'list_columns';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'list_manager_id',
        'sort_order',
        'label',
        'field_key',
        'concat_json',
        'format',
        'cell_class',
        'fallback',
        'sortable',
        'sort_key',
        'sort_concat_json',
        'visible',
    ];

    protected array $likeFields = [
        'label',
        'field_key',
        'sort_key',
    ];

    protected array $sortableFields = [
        'id',
        'list_manager_id',
        'sort_order',
        'label',
        'field_key',
        'format',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'label',
        'field_key',
        'sort_key',
        'cell_class',
    ];
}
