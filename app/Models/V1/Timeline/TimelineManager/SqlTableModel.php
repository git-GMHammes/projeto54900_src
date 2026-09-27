<?php

namespace App\Models\V1\Timeline\TimelineManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela timeline_manager — a timeline de cada usuario.
 *
 * Relacao 1:1 com user_manager (UNIQUE user_manager_id). A linha e criada pelo
 * Processor de TimelinePosts na primeira publicacao e depois editada pelo dono
 * pelo formulario timeline-settings.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'timeline_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'user_manager_id',
        'slug',
        'title',
        'description',
        'cover_image_url',
        'status',
        'version',
    ];

    protected array $likeFields = ['slug', 'title', 'description'];

    protected array $sortableFields = [
        'id', 'user_manager_id', 'slug', 'title', 'status', 'version',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['slug', 'title', 'description'];

    /**
     * A timeline do usuario (1:1). Usada pelo Processor de TimelinePosts para
     * decidir entre criar a timeline e reaproveitar a existente.
     */
    public function findByUserManagerId(int $userManagerId): ?array
    {
        $row = $this->where('user_manager_id', $userManagerId)->first();

        return $row === null ? null : (array) $row;
    }

    /**
     * Mesma busca, mas enxergando a linha soft-deleted.
     *
     * A UNIQUE de user_manager_id vale tambem sobre a linha excluida, entao o
     * Processor precisa saber que ela existe antes de tentar inserir de novo
     * (nesse caso, restaura em vez de criar).
     */
    public function findByUserManagerIdWithDeleted(int $userManagerId): ?array
    {
        $row = $this->withDeleted()->where('user_manager_id', $userManagerId)->first();

        return $row === null ? null : (array) $row;
    }
}
