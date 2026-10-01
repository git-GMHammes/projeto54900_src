<?php

namespace App\Models\V1\ChatRooms\ChatMessages;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_messages — a mensagem de uma sala.
 *
 * `status` sent/blocked/removed: `blocked` e a mensagem barrada pelo filtro
 * de palavrao (integracao futura, dicionario ainda nao existe) — gravada
 * para auditoria mas nunca exibida; `removed` e remocao manual do autor ou
 * do moderador da sala. O Processor forca `user_manager_id` da sessao e
 * `status='sent'` no create; conteudo e imutavel apos criado.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_messages';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_rooms_manager_id',
        'user_manager_id',
        'content',
        'status',
    ];

    protected array $likeFields = ['content'];

    protected array $sortableFields = [
        'id', 'chat_rooms_manager_id', 'user_manager_id', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['content'];
}
