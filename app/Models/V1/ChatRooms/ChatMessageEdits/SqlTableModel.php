<?php

namespace App\Models\V1\ChatRooms\ChatMessageEdits;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela chat_message_edits — histórico de edições de conteúdo.
 *
 * Sem rota própria: as linhas são gravadas pelo Processor de ChatMessages no
 * mesmo update do conteúdo (só admin edita). Não tem soft delete: o histórico
 * não pode sumir.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'chat_message_edits';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = false;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'chat_message_id',
        'content_before',
        'edited_by_user_manager_id',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'chat_message_id', 'edited_by_user_manager_id', 'created_at',
    ];

    public array $searchFields = [];
}
