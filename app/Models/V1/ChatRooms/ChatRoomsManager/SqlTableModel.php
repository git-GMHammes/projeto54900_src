<?php

namespace App\Models\V1\ChatRooms\ChatRoomsManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_rooms_manager — a sala de chat.
 *
 * Dono/moderador em owner_user_manager_id (nunca 1:1 — um usuario pode ter
 * varias salas). moderation_accepted e imutavel apos o create (aceite de
 * responsabilidade pela moderacao); status alterna open/closed pelo dono.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_rooms_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'owner_user_manager_id',
        'name',
        'description',
        'moderation_accepted',
        'moderation_accepted_at',
        'status',
        'closed_at',
        'closed_reason',
    ];

    protected array $likeFields = ['name', 'description', 'closed_reason'];

    protected array $sortableFields = [
        'id', 'owner_user_manager_id', 'name', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'description'];

    /**
     * Salas de um dono (qualquer status). Usada pelo Processor para checar
     * propriedade sem expor a coluna via find() genérico de outro usuario.
     */
    public function findByOwner(int $ownerUserManagerId): array
    {
        return $this->where('owner_user_manager_id', $ownerUserManagerId)->findAll();
    }
}
