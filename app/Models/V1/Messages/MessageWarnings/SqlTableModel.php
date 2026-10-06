<?php

namespace App\Models\V1\Messages\MessageWarnings;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_warnings — advertencia de palavrao no modulo Messages: a tentativa de enviar (ou
 * editar para) um texto com palavra proibida. Mesmo desenho de chat_room_warnings; `message_groups_manager_id`
 * NULL = conversa privada. O registro automatico (backend) usa register(); o CRUD da API e so admin.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_warnings';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'messages_manager_id',
        'user_manager_id',
        'message_groups_manager_id',
        'flagged_word',
    ];

    protected array $likeFields = ['flagged_word'];

    protected array $sortableFields = [
        'id', 'messages_manager_id', 'user_manager_id', 'message_groups_manager_id', 'flagged_word',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['flagged_word'];

    /** Grava a advertencia (direto no model — o registro automatico nao passa pelo Processor admin). Devolve o id. */
    public function register(int $messageId, int $userId, ?int $groupId, string $word): int
    {
        $ok = $this->db->table($this->table)->insert([
            'messages_manager_id'       => $messageId,
            'user_manager_id'           => $userId,
            'message_groups_manager_id' => $groupId,
            'flagged_word'              => mb_substr($word, 0, 150),
        ]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Grupo (nao excluido) da mensagem de grupo; null se a mensagem e privada. */
    public function groupIdOfMessage(int $messageId): ?int
    {
        $row = $this->db->table('message_group_messages')
            ->select('message_groups_manager_id')
            ->where('messages_manager_id', $messageId)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();

        return $row === null ? null : (int) $row['message_groups_manager_id'];
    }

    /** Mensagem (messages_manager) inclusive soft-deletada; null se nao existe. */
    public function findMessage(int $messageId): ?array
    {
        return $this->db->table('messages_manager')->where('id', $messageId)->get()->getRowArray();
    }

    /** O usuario existe (nao excluido)? */
    public function userExists(int $userId): bool
    {
        return $this->db->table('user_manager')->where('id', $userId)->where('deleted_at', null)->countAllResults() > 0;
    }
}
