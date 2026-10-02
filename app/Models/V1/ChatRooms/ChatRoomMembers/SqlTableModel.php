<?php

namespace App\Models\V1\ChatRooms\ChatRoomMembers;

use App\Models\V1\BaseTableModel;

/**
 * Model interno da tabela chat_room_members — quem esta na sala.
 *
 * Alem de servir a outros Processors do modulo ChatRooms (ChatRoomAttachmentReports,
 * regra §4.6, que consultam/bloqueiam a matricula), e a base do recurso
 * api/v1/chat-room-members (Controller/Request/Processor/Rotas em
 * ChatRoomMembers). `role` owner/member; `status` active/blocked/left;
 * `blocked_reason` distingue profanity_3x/attachment_report/manual.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_room_members';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_rooms_manager_id',
        'user_manager_id',
        'role',
        'status',
        'blocked_reason',
        'blocked_at',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'chat_rooms_manager_id', 'user_manager_id', 'role', 'status',
        'blocked_reason', 'blocked_at', 'created_at', 'updated_at',
    ];

    // Busca textual por nome de sala/usuario fica na view (SqlViewModel);
    // a tabela so tem ids e enums.
    public array $searchFields = ['role', 'status', 'blocked_reason'];

    /**
     * Matricula de um usuario numa sala (qualquer status), usada pelo
     * ChatRoomAttachmentReports/Processor para bloquear o autor do upload.
     */
    public function findByRoomAndUser(int $chatRoomsManagerId, int $userManagerId): ?array
    {
        return $this->where('chat_rooms_manager_id', $chatRoomsManagerId)
            ->where('user_manager_id', $userManagerId)
            ->first();
    }
}
