<?php

namespace App\Models\V1\Timeline\TimelinePostReports;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_post_reports — denuncia e fila de moderacao.
 *
 * Uma denuncia por usuario por post. `status`, `reviewed_by`, `reviewed_at` e
 * `review_note` sao a fila de moderacao (rotas adminonly), nao o formulario de
 * denuncia: o Processor apaga esses campos quando quem envia nao e admin.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_post_reports';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'timeline_post_id',
        'user_manager_id',
        'reason',
        'description',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected array $likeFields = ['reason', 'description', 'review_note'];

    protected array $sortableFields = [
        'id', 'timeline_post_id', 'user_manager_id', 'reason', 'status',
        'reviewed_by', 'reviewed_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['description', 'review_note', 'reason'];
}
