<?php

namespace App\Models\V1\ChatRooms\ChatMessageMentions;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_message_mentions — usuarios marcados numa mensagem.
 *
 * Nao tem rota propria: as linhas sao gravadas pelo Processor de
 * ChatMessages no mesmo create da mensagem (o usuario precisa ser membro
 * ativo da sala da mensagem).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_message_mentions';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_message_id',
        'user_manager_id',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'chat_message_id', 'user_manager_id', 'created_at', 'updated_at',
    ];

    public array $searchFields = [];
}
