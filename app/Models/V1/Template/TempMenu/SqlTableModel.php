<?php

namespace App\Models\V1\Template\TempMenu;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela temp_menu.
 *
 * Tabela: temp_menu (arvore de itens navegaveis do Menu)
 * DDL: id (BIGINT PK auto), company_manager (JSON NOT NULL - lista de ids de empresa), temp_nav_id (FK -> temp_nav, CASCADE),
 *      parent_id (FK -> temp_menu, self, CASCADE, nullable),
 *      title, react_route (nullable),
 *      placement (ENUM navbar/offcanvas, default navbar - destino do item de
 *      topo e de seus filhos), roles (JSON, nullable - lista de slugs
 *      de user_roles com acesso ao item),
 *      sort_order (default 0), status (ENUM active/draft/inactive, default draft),
 *      created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so enxerga as linhas cuja lista company_manager traz o slug da empresa da sessao. */
    protected string $companyScope = 'json_slug';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'temp_menu';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'temp_nav_id',
        'parent_id',
        'title',
        'react_route',
        'icon',
        'placement',
        'is_bookmark',
        'roles',
        'sort_order',
        'status',
        'company_manager',
    ];

    protected array $likeFields = [
        'title',
        'react_route',
    ];

    protected array $sortableFields = [
        'id',
        'temp_nav_id',
        'parent_id',
        'title',
        'placement',
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
