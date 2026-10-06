<?php

namespace App\Models\V1\Messages\MessageGroupMessages;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_group_messages — ligacao entre uma mensagem
 * (messages_manager, destinatario NULL) e o grupo que a recebe. `messages_manager_id`
 * e UNIQUE: uma mensagem, um grupo. Os destinatarios sao os membros ativos do grupo
 * (message_group_members), resolvidos na leitura; nao ha copia por membro.
 *
 * Os metodos de apoio abaixo gravam tambem em messages_manager, sempre dentro da
 * transacao aberta pelo Processor.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_group_messages';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'messages_manager_id',
        'message_groups_manager_id',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'messages_manager_id', 'message_groups_manager_id', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['id'];

    /**
     * Ids das ligacoes que o usuario pode ver (inclui soft-deletadas, para get-deleted*):
     * as que ele enviou, as dos grupos que ele criou e as ja enviadas (`sent`) dos grupos
     * em que e membro ativo. Admin nao usa este metodo.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->query(
            "SELECT mgl.id
               FROM message_group_messages mgl
               JOIN messages_manager mm ON mm.id = mgl.messages_manager_id
               JOIN message_groups_manager mg ON mg.id = mgl.message_groups_manager_id
              WHERE mm.sender_user_manager_id = ?
                 OR mg.owner_user_manager_id = ?
                 OR (mm.status = 'sent' AND mgl.message_groups_manager_id IN (
                        SELECT message_groups_manager_id FROM message_group_members
                         WHERE user_manager_id = ? AND status = 'active' AND deleted_at IS NULL))",
            [$userId, $userId, $userId]
        )->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /** Ligacao inclusive soft-deletada; null se nao existe. */
    public function findLink(int $id): ?array
    {
        return $this->findWithDeleted($id);
    }

    /** Mensagem (messages_manager) inclusive soft-deletada; null se nao existe. */
    public function findMessage(int $messageId): ?array
    {
        return $this->db->table('messages_manager')->where('id', $messageId)->get()->getRowArray();
    }

    /** Grupo (dono e status), sem soft-deletado; null se nao existe. */
    public function findGroup(int $groupId): ?array
    {
        return $this->db->table('message_groups_manager')
            ->select('id, owner_user_manager_id, status')
            ->where('id', $groupId)
            ->where('deleted_at', null)
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

    /** Insere a mensagem de grupo (destinatario NULL) e devolve o id (0 se falhar). */
    public function insertMessage(array $row): int
    {
        $row['recipient_user_manager_id'] = null;
        $row['read_at']                   = null;

        return $this->db->table('messages_manager')->insert($row) ? (int) $this->db->insertID() : 0;
    }

    /** Insere a ligacao mensagem-grupo e devolve o id (0 se falhar). */
    public function insertLink(int $messageId, int $groupId): int
    {
        $ok = $this->db->table($this->table)->insert([
            'messages_manager_id'       => $messageId,
            'message_groups_manager_id' => $groupId,
        ]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Atualiza colunas da mensagem. */
    public function updateMessage(int $messageId, array $fields): void
    {
        $this->db->table('messages_manager')->where('id', $messageId)->update($fields);
    }

    /** Marca a mensagem como excluida (soft). */
    public function softDeleteMessage(int $messageId): void
    {
        $this->db->table('messages_manager')->where('id', $messageId)->update(['deleted_at' => date('Y-m-d H:i:s')]);
    }

    /** Restaura a mensagem excluida. */
    public function restoreMessage(int $messageId): void
    {
        $this->db->table('messages_manager')->where('id', $messageId)->update(['deleted_at' => null]);
    }

    /** Exclui a mensagem em definitivo (a ligacao sai junto, por FK ON DELETE CASCADE). */
    public function hardDeleteMessage(int $messageId): void
    {
        $this->db->table('messages_manager')->where('id', $messageId)->delete();
    }

    /**
     * Ids das mensagens das ligacoes soft-deletadas (todas, ou a ligacao `$id`).
     *
     * @return list<int>
     */
    public function deletedMessageIds(?int $id = null): array
    {
        $builder = $this->db->table($this->table)->select('messages_manager_id')->where('deleted_at IS NOT NULL', null, false);
        if ($id !== null) {
            $builder->where('id', $id);
        }

        return array_map(static fn (array $row): int => (int) $row['messages_manager_id'], $builder->get()->getResultArray());
    }

    /**
     * Mensagens da conversa do grupo para o MODO CHAT: as `sent` de qualquer membro e as `scheduled`
     * so do proprio usuario; as ultimas $limit, das mais novas para as mais antigas.
     *
     * @return list<array<string, mixed>>
     */
    public function chatMessages(int $groupId, int $userId, int $limit = 200): array
    {
        return $this->db->query(
            "SELECT m.id, l.id AS link_id, m.content, m.status, m.sender_user_manager_id,
                    m.scheduled_at, m.sent_at, m.created_at,
                    uc.name AS author_name, um.username AS author_username,
                    (SELECT COUNT(0)
                       FROM message_group_reads r
                       JOIN message_group_members gm ON gm.user_manager_id = r.user_manager_id
                        AND gm.message_groups_manager_id = l.message_groups_manager_id
                        AND gm.status = 'active' AND gm.deleted_at IS NULL
                      WHERE r.messages_manager_id = m.id AND r.deleted_at IS NULL
                        AND r.user_manager_id <> m.sender_user_manager_id) AS read_count
               FROM message_group_messages l
               JOIN messages_manager m ON m.id = l.messages_manager_id AND m.deleted_at IS NULL
               LEFT JOIN user_manager um ON um.id = m.sender_user_manager_id
               LEFT JOIN user_profiles uc ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
              WHERE l.message_groups_manager_id = ? AND l.deleted_at IS NULL
                AND (m.status = 'sent' OR (m.status = 'scheduled' AND m.sender_user_manager_id = ?))
              ORDER BY COALESCE(m.sent_at, m.scheduled_at, m.created_at) DESC, m.id DESC
              LIMIT " . (int) $limit,
            [$groupId, $userId]
        )->getResultArray();
    }

    /**
     * Ids dos membros ativos do grupo.
     *
     * @return list<int>
     */
    public function activeMemberIds(int $groupId): array
    {
        $rows = $this->db->table('message_group_members')
            ->select('user_manager_id')
            ->where('message_groups_manager_id', $groupId)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['user_manager_id'], $rows);
    }

    /**
     * Marca como lidas (message_group_reads) as mensagens `sent` do grupo enviadas por OUTROS e ainda
     * nao lidas por $userId. Idempotente. Devolve quantas estavam nao lidas.
     */
    public function markGroupRead(int $groupId, int $userId): int
    {
        $unread = (int) $this->db->query(
            "SELECT COUNT(0) AS c
               FROM message_group_messages l
               JOIN messages_manager m ON m.id = l.messages_manager_id AND m.deleted_at IS NULL
              WHERE l.message_groups_manager_id = ? AND l.deleted_at IS NULL
                AND m.status = 'sent' AND m.sender_user_manager_id <> ?
                AND NOT EXISTS (SELECT 1 FROM message_group_reads r
                                 WHERE r.messages_manager_id = m.id AND r.user_manager_id = ? AND r.deleted_at IS NULL)",
            [$groupId, $userId, $userId]
        )->getRow()->c;

        if ($unread === 0) {
            return 0;
        }

        $this->db->query(
            "INSERT INTO message_group_reads (messages_manager_id, user_manager_id, read_at, created_at, updated_at)
             SELECT m.id, ?, NOW(), NOW(), NOW()
               FROM message_group_messages l
               JOIN messages_manager m ON m.id = l.messages_manager_id AND m.deleted_at IS NULL
              WHERE l.message_groups_manager_id = ? AND l.deleted_at IS NULL
                AND m.status = 'sent' AND m.sender_user_manager_id <> ?
             ON DUPLICATE KEY UPDATE deleted_at = NULL",
            [$userId, $groupId, $userId]
        );

        return $unread;
    }
}
