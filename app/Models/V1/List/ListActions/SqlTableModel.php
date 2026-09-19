<?php

namespace App\Models\V1\List\ListActions;

use App\Models\V1\BaseTableModel;

/**
 * Model de escrita/leitura da tabela list_actions.
 *
 * Tabela: list_actions (FK list_manager_id -> list_manager, CASCADE).
 * DDL: id (BIGINT PK auto), list_manager_id, sort_order (default 0), label,
 *      icon, action_type (enum link/api_call, default link), href_template,
 *      api_endpoint, http_method (default 'GET'), data_action, target,
 *      confirm (TINYINT(1) default 0), confirm_message, extra_data_json,
 *      roles, business_rule_json, created_at, updated_at, deleted_at.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'list_actions';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'list_manager_id',
        'sort_order',
        'label',
        'icon',
        'action_type',
        'href_template',
        'api_endpoint',
        'http_method',
        'data_action',
        'target',
        'confirm',
        'confirm_message',
        'extra_data_json',
        'roles',
        'business_rule_json',
    ];

    protected array $likeFields = [
        'label',
        'data_action',
        'href_template',
        'api_endpoint',
    ];

    protected array $sortableFields = [
        'id',
        'list_manager_id',
        'sort_order',
        'label',
        'action_type',
        'created_at',
        'updated_at',
    ];

    public array $searchFields = [
        'label',
        'data_action',
        'href_template',
        'api_endpoint',
        'confirm_message',
    ];
}
