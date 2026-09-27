<?php

namespace App\Models\V1\Timeline\TimelinePosts;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_posts — a publicacao (e a republicacao).
 *
 * `repost_of_id` e o auto-relacionamento da republicacao; `user_manager_id` e
 * redundante com o dono da timeline de proposito (o Processor valida que os
 * dois batem). `published_at`/`edited_at` sao preenchidos pelo Processor.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_posts';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'timeline_manager_id',
        'user_manager_id',
        'repost_of_id',
        'title',
        'content',
        'status',
        'published_at',
        'edited_at',
    ];

    protected array $likeFields = ['title', 'content'];

    protected array $sortableFields = [
        'id', 'timeline_manager_id', 'user_manager_id', 'repost_of_id',
        'title', 'status', 'published_at', 'edited_at',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['title', 'content'];
}
