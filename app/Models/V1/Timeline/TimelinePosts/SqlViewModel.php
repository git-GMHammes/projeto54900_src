<?php

namespace App\Models\V1\Timeline\TimelinePosts;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_posts — o feed (timeline + autor + repost + contadores).
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_posts';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'tp_title', 'tp_content',
        'tm_title', 'tm_slug',
        'um_username', 'uc_name',
        'ru_username', 'rc_name',
    ];

    protected array $sortableFields = [
        'id', 'tp_timeline_manager_id', 'tp_user_manager_id', 'tp_repost_of_id',
        'tp_title', 'tp_status', 'tp_published_at', 'tp_edited_at',
        'tm_id', 'tm_slug', 'tm_title', 'tm_status',
        'um_id', 'um_username', 'um_status',
        'uc_id', 'uc_name',
        'rp_id',
        'comments_count', 'likes_count', 'dislikes_count', 'ratings_count', 'ratings_avg',
        'reposts_count', 'attachments_count',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['tp_title', 'tp_content', 'um_username', 'uc_name', 'tm_title'];

    public array $filterFields = ['tp_status', 'tm_status', 'um_status'];
}
