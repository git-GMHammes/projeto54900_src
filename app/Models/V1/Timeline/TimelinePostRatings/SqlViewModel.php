<?php

namespace App\Models\V1\Timeline\TimelinePostRatings;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_post_ratings — avaliacao + autor + post.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_post_ratings';
    protected $primaryKey = 'id';

    protected array $likeFields = ['um_username', 'uc_name', 'tp_title'];

    protected array $sortableFields = [
        'id', 'rt_timeline_post_id', 'rt_user_manager_id', 'rt_rating',
        'um_username', 'uc_name',
        'tp_id', 'tp_title', 'tp_status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['um_username', 'uc_name', 'tp_title'];

    public array $filterFields = ['rt_rating', 'tp_status'];
}
