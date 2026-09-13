<?php

namespace App\Models\V1\Menu\MenuManager;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela menu_manager.
 *
 * Tabela: menu_manager (arvore de itens navegaveis do Menu)
 * DDL: id (BIGINT PK auto), nav_manager_id (FK -> nav_manager, CASCADE),
 *      parent_id (FK -> menu_manager, self, CASCADE, nullable),
 *      title, react_route (nullable), roles (JSON, nullable - lista de slugs
 *      de user_roles com acesso ao item),
 *      sort_order (default 0), status (ENUM active/draft/inactive, default draft),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'menu_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'nav_manager_id',
        'parent_id',
        'title',
        'react_route',
        'roles',
        'sort_order',
        'status',
    ];

    protected array $likeFields = [
        'title',
        'react_route',
    ];

    protected array $sortableFields = [
        'id',
        'nav_manager_id',
        'parent_id',
        'title',
        'sort_order',
        'status',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'title',
        'react_route',
    ];
}
