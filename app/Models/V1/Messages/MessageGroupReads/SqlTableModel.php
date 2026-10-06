<?php

namespace App\Models\V1\Messages\MessageGroupReads;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_group_reads — leitura por membro de uma mensagem de grupo (UNIQUE
 * mensagem+usuario). O `read_at` de messages_manager so serve ao 1 para 1; aqui cada membro
 * tem a sua linha. O remetente nao le a propria mensagem.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_group_reads';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'messages_manager_id',
        'user_manager_id',
        'read_at',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'messages_manager_id', 'user_manager_id', 'read_at', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['id'];

    /**
     * Ids das leituras que o usuario pode ver (inclui soft-deletadas, para get-deleted*): as dele,
     * as das mensagens que ele enviou ("quem leu") e as dos grupos que ele criou. Admin nao usa.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->query(
            'SELECT r.id
               FROM message_group_reads r
               JOIN messages_manager mm ON mm.id = r.messages_manager_id
               LEFT JOIN message_group_messages mgl ON mgl.messages_manager_id = mm.id AND mgl.deleted_at IS NULL
               LEFT JOIN message_groups_manager mg ON mg.id = mgl.message_groups_manager_id
              WHERE r.user_manager_id = ? OR mm.sender_user_manager_id = ? OR mg.owner_user_manager_id = ?',
            [$userId, $userId, $userId]
        )->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /**
     * Dados da mensagem de GRUPO: grupo, dono, remetente e status; null se nao e mensagem de grupo
     * ou foi excluida.
     */
    public function findGroupMessage(int $messageId): ?array
    {
        return $this->db->table('messages_manager mm')
            ->select('mm.id, mm.status, mm.sender_user_manager_id AS sender_id, mgl.message_groups_manager_id AS group_id, mg.owner_user_manager_id AS owner_id')
            ->join('message_group_messages mgl', 'mgl.messages_manager_id = mm.id AND mgl.deleted_at IS NULL')
            ->join('message_groups_manager mg', 'mg.id = mgl.message_groups_manager_id AND mg.deleted_at IS NULL')
            ->where('mm.id', $messageId)
            ->where('mm.deleted_at', null)
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

    /** O usuario existe e esta ativo? */
    public function isActiveUser(int $userId): bool
    {
        return $this->db->table('user_manager')->where('id', $userId)->where('status', 'active')->where('deleted_at', null)->countAllResults() > 0;
    }

    /** Leitura (mensagem, usuario), inclusive soft-deletada; null se nunca existiu. */
    public function findPair(int $messageId, int $userId): ?array
    {
        return $this->db->table($this->table)
            ->where('messages_manager_id', $messageId)
            ->where('user_manager_id', $userId)
            ->get()
            ->getRowArray();
    }

    /** Insere a leitura agora e devolve o id (0 se falhar). */
    public function insertRead(int $messageId, int $userId): int
    {
        $ok = $this->db->table($this->table)->insert([
            'messages_manager_id' => $messageId,
            'user_manager_id'     => $userId,
            'read_at'             => date('Y-m-d H:i:s'),
        ]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Reativa uma leitura soft-deletada (limpa deleted_at). */
    public function reactivate(int $id): void
    {
        $this->db->table($this->table)->where('id', $id)->update(['deleted_at' => null]);
    }
}
