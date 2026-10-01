<?php

namespace App\Models\V1\ChatRooms\ChatRoomMembers;

use App\Models\V1\BaseTableModel;

/**
 * Model interno da tabela chat_room_members — quem esta na sala.
 *
 * APENAS o Model: este arquivo existe so para que outros Processors do
 * modulo ChatRooms (hoje: ChatRoomAttachmentReports, regra §4.6) possam
 * consultar/bloquear a matricula de um usuario numa sala. Controller/
 * Request/Processor/Rotas do modulo ChatRoomMembers ainda NAO existem —
 * ficam para quando esse recurso for construido de verdade (ver
 * README_modulo_chatrooms.md §7). `role` owner/member; `status`
 * active/blocked/left; `blocked_reason` distingue profanity_3x/
 * attachment_report/manual.
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
        'created_at', 'updated_at',
    ];

    public array $searchFields = [];

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
