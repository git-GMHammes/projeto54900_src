<?php

namespace App\Models\V1\Timeline\TimelineManager;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_manager — timeline + dono (user_manager/user_profiles).
 *
 * Somente leitura: a view nao tem allowedFields, soft delete nem timestamps
 * proprios (os timestamps expostos sao da tabela principal).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_manager';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'tm_slug', 'tm_title', 'tm_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    protected array $sortableFields = [
        'id', 'tm_user_manager_id', 'tm_slug', 'tm_title', 'tm_status', 'tm_version',
        'um_id', 'um_username', 'um_status',
        'uc_id', 'uc_name', 'uc_email',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [
        'tm_slug', 'tm_title', 'tm_description',
        'um_username', 'uc_name', 'uc_email',
    ];

    public array $filterFields = ['tm_status', 'um_status'];
}
