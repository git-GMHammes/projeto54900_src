<?php

namespace App\Models\V1\Timeline\TimelinePostComments;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_post_comments — comentario + autor + post + pai.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_post_comments';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'tc_content', 'um_username', 'uc_name', 'tp_title', 'pc_content',
    ];

    protected array $sortableFields = [
        'id', 'tc_timeline_post_id', 'tc_user_manager_id', 'tc_parent_id',
        'tc_status', 'tc_edited_at',
        'um_username', 'uc_name',
        'tp_id', 'tp_title', 'tp_status',
        'pc_id',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['tc_content', 'um_username', 'uc_name', 'tp_title'];

    public array $filterFields = ['tc_status', 'tp_status'];
}
