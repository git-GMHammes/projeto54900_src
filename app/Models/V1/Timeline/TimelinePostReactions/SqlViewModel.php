<?php

namespace App\Models\V1\Timeline\TimelinePostReactions;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_post_reactions — reacao + autor + post.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_post_reactions';
    protected $primaryKey = 'id';

    protected array $likeFields = ['tr_reaction_type', 'um_username', 'uc_name', 'tp_title'];

    protected array $sortableFields = [
        'id', 'tr_timeline_post_id', 'tr_user_manager_id', 'tr_reaction_type',
        'um_username', 'uc_name',
        'tp_id', 'tp_title', 'tp_status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['tr_reaction_type', 'um_username', 'uc_name', 'tp_title'];

    public array $filterFields = ['tr_reaction_type', 'tp_status'];
}
