<?php

namespace App\Models\V1\Timeline\TimelinePostAttachments;

use App\Models\V1\BaseViewModel;

/**
 * Model da view view_timeline_post_attachments — anexo + post dono + autor do post.
 */
class SqlViewModel extends BaseViewModel
{
    protected $DBGroup    = DB_GROUP_001;
    protected $table      = 'view_timeline_post_attachments';
    protected $primaryKey = 'id';

    protected array $likeFields = [
        'ta_title', 'ta_description', 'ta_original_name',
        'tp_title', 'um_username', 'uc_name',
    ];

    protected array $sortableFields = [
        'id', 'ta_timeline_post_id', 'ta_file_key', 'ta_original_name', 'ta_extension',
        'ta_file_size', 'ta_category', 'ta_title', 'ta_sort_order', 'ta_status',
        'tp_id', 'tp_timeline_manager_id', 'tp_user_manager_id', 'tp_title', 'tp_status',
        'um_username', 'uc_name',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['ta_title', 'ta_description', 'ta_original_name', 'tp_title'];

    public array $filterFields = ['ta_category', 'ta_status', 'tp_status'];
}
