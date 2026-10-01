<?php

namespace App\Models\V1\ChatRooms\ChatRoomFavorites;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_room_favorites — sala favorita (por usuario).
 *
 * Uma linha por usuario por sala (UNIQUE chat_rooms_manager_id +
 * user_manager_id): favoritar de novo nao cria linha nova, o Processor acha
 * a linha existente (mesmo soft-deleted) e restaura se for o caso. Nao
 * existe formulario para esta tabela (e acao de um clique).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_room_favorites';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_rooms_manager_id',
        'user_manager_id',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'chat_rooms_manager_id', 'user_manager_id', 'created_at', 'updated_at',
    ];

    public array $searchFields = [];
}
