<?php

namespace App\Models\V1\Messages\MessageAttachments;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_attachments — anexo de uma mensagem (messages_manager), privada
 * ou de grupo. Tabela propria e isolada do modulo Upload (mesma decisao do chat e da
 * Timeline). O arquivo fisico fica em writable/uploads/message_attachments/<messages_manager_id>/;
 * estas colunas guardam os metadados. Para saber se a mensagem e de grupo, ver
 * message_group_messages (a ligacao).
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_attachments';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = ['checksum_sha256'];

    protected $allowedFields = [
        'messages_manager_id',
        'file_key',
        'original_name',
        'stored_name',
        'storage_path',
        'file_url',
        'mime_type',
        'extension',
        'file_size',
        'checksum_sha256',
        'category',
        'status',
    ];

    protected array $likeFields = ['original_name', 'stored_name'];

    protected array $sortableFields = [
        'id', 'messages_manager_id', 'file_key', 'original_name', 'stored_name',
        'extension', 'file_size', 'category', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['original_name'];

    /**
     * Ids dos anexos que o usuario pode ver (inclui soft-deletados, para get-deleted*):
     * os das mensagens que ele enviou, os dos grupos que ele criou e os das mensagens
     * ja enviadas (`sent`) em que e destinatario ou membro ativo do grupo. Admin nao usa.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->query(
            "SELECT a.id
               FROM message_attachments a
               JOIN messages_manager mm ON mm.id = a.messages_manager_id
               LEFT JOIN message_group_messages mgl ON mgl.messages_manager_id = mm.id AND mgl.deleted_at IS NULL
               LEFT JOIN message_groups_manager mg ON mg.id = mgl.message_groups_manager_id
              WHERE mm.sender_user_manager_id = ?
                 OR mg.owner_user_manager_id = ?
                 OR (mm.status = 'sent' AND (
                        mm.recipient_user_manager_id = ?
                        OR mgl.message_groups_manager_id IN (
                            SELECT message_groups_manager_id FROM message_group_members
                             WHERE user_manager_id = ? AND status = 'active' AND deleted_at IS NULL)))",
            [$userId, $userId, $userId, $userId]
        )->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /** Mensagem (messages_manager) inclusive soft-deletada; null se nao existe. */
    public function findMessage(int $messageId): ?array
    {
        return $this->db->table('messages_manager')->where('id', $messageId)->get()->getRowArray();
    }

    /** Grupo da mensagem (id e dono), ou null se for mensagem privada. */
    public function findMessageGroup(int $messageId): ?array
    {
        return $this->db->table('message_group_messages mgl')
            ->select('mgl.message_groups_manager_id AS group_id, mg.owner_user_manager_id AS owner_id')
            ->join('message_groups_manager mg', 'mg.id = mgl.message_groups_manager_id')
            ->where('mgl.messages_manager_id', $messageId)
            ->where('mgl.deleted_at', null)
            ->get()
            ->getRowArray();
    }

    /** O usuario e membro ativo (nao excluido) do grupo? */
    public function isActiveMember(int $groupId, int $userId): bool
    {
        return $this->db->table('message_group_members')
            ->where('message_groups_manager_id', $groupId)
            ->where('user_manager_id', $userId)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }

    /**
     * Soft delete dos anexos ativos da mensagem, exceto `$exceptId` (troca de anexo).
     *
     * @return int quantidade de anexos afetados
     */
    public function softDeleteOthers(int $messageId, int $exceptId): int
    {
        $this->db->table($this->table)
            ->where('messages_manager_id', $messageId)
            ->where('id !=', $exceptId)
            ->where('deleted_at', null)
            ->update(['deleted_at' => date('Y-m-d H:i:s')]);

        return $this->db->affectedRows();
    }
}
