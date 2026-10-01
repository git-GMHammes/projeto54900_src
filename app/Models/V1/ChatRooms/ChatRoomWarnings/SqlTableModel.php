<?php

namespace App\Models\V1\ChatRooms\ChatRoomWarnings;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_room_warnings — advertencia automatica de palavrao.
 *
 * Sem coluna de contador (README §2.6/§4.5): a contagem de 3 advertencias
 * por usuario/sala e sempre COUNT(*) desta tabela, nunca um campo
 * denormalizado. Nasce quando o filtro de palavrao (dicionario JSON, ainda
 * nao existe) barra uma mensagem — ate isso ser construido em ChatMessages,
 * as linhas so entram por acao manual de admin via este modulo.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_room_warnings';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_rooms_manager_id',
        'user_manager_id',
        'chat_message_id',
        'flagged_word',
    ];

    protected array $likeFields = ['flagged_word'];

    protected array $sortableFields = [
        'id', 'chat_rooms_manager_id', 'user_manager_id', 'chat_message_id',
        'flagged_word', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['flagged_word'];

    /**
     * Quantas advertencias (nao excluidas) um usuario tem numa sala — base
     * da regra "3 advertencias bloqueia o membro" (README §4.5), usada pelo
     * futuro ChatMessages/Processor quando o filtro de palavrao existir.
     */
    public function countByRoomAndUser(int $chatRoomsManagerId, int $userManagerId): int
    {
        return $this->where('chat_rooms_manager_id', $chatRoomsManagerId)
            ->where('user_manager_id', $userManagerId)
            ->countAllResults();
    }
}
