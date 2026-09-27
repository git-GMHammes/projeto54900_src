<?php

namespace App\Models\V1\Timeline\TimelinePostRatings;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_post_ratings — estrelas de 1 a 5.
 *
 * Uma avaliacao por usuario por post (UNIQUE timeline_post_id +
 * user_manager_id). O intervalo 1..5 e regra do Request/Processor: o banco nao
 * usa CHECK. Nao existe formulario para esta tabela (e acao de um clique).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_post_ratings';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'timeline_post_id',
        'user_manager_id',
        'rating',
    ];

    protected array $likeFields = ['rating'];

    protected array $sortableFields = [
        'id', 'timeline_post_id', 'user_manager_id', 'rating',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['rating'];
}
