<?php

namespace App\Models\V1\Timeline\TimelinePostComments;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_post_comments — comentario e resposta.
 *
 * `parent_id` nulo = comentario de topo; preenchido = resposta ao comentario
 * indicado (o Processor garante que o pai e do mesmo post). `edited_at` marca a
 * edicao do conteudo.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_post_comments';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'timeline_post_id',
        'user_manager_id',
        'parent_id',
        'content',
        'status',
        'edited_at',
    ];

    protected array $likeFields = ['content'];

    protected array $sortableFields = [
        'id', 'timeline_post_id', 'user_manager_id', 'parent_id',
        'status', 'edited_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['content'];
}
