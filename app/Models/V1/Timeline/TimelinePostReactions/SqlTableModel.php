<?php

namespace App\Models\V1\Timeline\TimelinePostReactions;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_post_reactions — like / dislike.
 *
 * Uma reacao por usuario por post (UNIQUE timeline_post_id + user_manager_id):
 * curtir de novo nao cria linha nova, alternar like <-> dislike e UPDATE do
 * reaction_type. Nao existe formulario para esta tabela (e acao de um clique).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_post_reactions';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'timeline_post_id',
        'user_manager_id',
        'reaction_type',
    ];

    protected array $likeFields = ['reaction_type'];

    protected array $sortableFields = [
        'id', 'timeline_post_id', 'user_manager_id', 'reaction_type',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['reaction_type'];
}
