<?php

namespace App\Models\V1\Timeline\TimelinePostAttachments;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_post_attachments — anexos do post.
 *
 * Tabela propria e isolada do modulo Upload e do Calendar. O arquivo fisico fica
 * em writable/uploads/timeline_posts/<post_id>/; estas colunas guardam os
 * metadados (mesmo conjunto de colunas locais da tabela `uploads`).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_post_attachments';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = ['checksum_sha256'];

    protected $allowedFields = [
        'timeline_post_id',
        'file_key',
        'original_name',
        'stored_name',
        'storage_path',
        'file_url',
        'mime_type',
        'extension',
        'file_size',
        'checksum_sha256',
        'category',
        'title',
        'description',
        'sort_order',
        'status',
    ];

    protected array $likeFields = ['title', 'description', 'original_name', 'stored_name'];

    protected array $sortableFields = [
        'id', 'timeline_post_id', 'file_key', 'original_name', 'stored_name',
        'extension', 'file_size', 'category', 'title', 'sort_order', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['title', 'description', 'original_name'];
}
