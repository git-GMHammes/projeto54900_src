<?php

namespace App\Models\V1\Messages\MessageMentions;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_mentions — marcacao de usuario (@) numa mensagem de GRUPO (UNIQUE
 * mensagem+usuario). Mesma estrutura de chat_message_mentions. So se marca membro ativo do grupo da
 * mensagem e nunca o proprio remetente; as regras ficam no Processor.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_mentions';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'messages_manager_id',
        'user_manager_id',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'messages_manager_id', 'user_manager_id', 'created_at', 'updated_at',
    ];

    public array $searchFields = ['id'];

    /**
     * Ids das marcacoes que o usuario pode ver (inclui soft-deletadas, para get-deleted*): as em que ele foi
     * marcado, as das mensagens que ele enviou e as dos grupos que ele criou. Admin nao usa.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->query(
            'SELECT t.id
               FROM message_mentions t
               JOIN messages_manager mm ON mm.id = t.messages_manager_id
               LEFT JOIN message_group_messages mgl ON mgl.messages_manager_id = mm.id AND mgl.deleted_at IS NULL
               LEFT JOIN message_groups_manager mg ON mg.id = mgl.message_groups_manager_id
              WHERE t.user_manager_id = ? OR mm.sender_user_manager_id = ? OR mg.owner_user_manager_id = ?',
            [$userId, $userId, $userId]
        )->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /** Mensagem de GRUPO (grupo, dono, remetente, status); null se nao e de grupo ou foi excluida. */
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

    /** Marcacao (mensagem, usuario), inclusive soft-deletada; null se nunca existiu. */
    public function findPair(int $messageId, int $userId): ?array
    {
        return $this->db->table($this->table)
            ->where('messages_manager_id', $messageId)
            ->where('user_manager_id', $userId)
            ->get()
            ->getRowArray();
    }

    /** Quantas marcacoes ativas a mensagem ja tem. */
    public function countForMessage(int $messageId): int
    {
        return $this->db->table($this->table)->where('messages_manager_id', $messageId)->where('deleted_at', null)->countAllResults();
    }

    /** Insere a marcacao e devolve o id (0 se falhar). */
    public function insertMention(int $messageId, int $userId): int
    {
        $ok = $this->db->table($this->table)->insert(['messages_manager_id' => $messageId, 'user_manager_id' => $userId]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Reativa uma marcacao soft-deletada (limpa deleted_at). */
    public function reactivate(int $id): void
    {
        $this->db->table($this->table)->where('id', $id)->update(['deleted_at' => null]);
    }

    /**
     * Marcacoes ativas das mensagens informadas, com o nome de quem foi marcado — para o chat.
     *
     * @param  list<int> $messageIds
     * @return array<int, list<array{user_id: int, name: string}>> por id de mensagem
     */
    public function mentionsFor(array $messageIds): array
    {
        if ($messageIds === []) {
            return [];
        }

        $rows = $this->db->table($this->table . ' t')
            ->select('t.messages_manager_id, t.user_manager_id, uc.name AS user_name, um.username AS username')
            ->join('user_manager um', 'um.id = t.user_manager_id', 'left')
            ->join('user_profiles uc', 'uc.user_manager_id = um.id AND uc.deleted_at IS NULL', 'left')
            ->whereIn('t.messages_manager_id', $messageIds)
            ->where('t.deleted_at', null)
            ->orderBy('t.id', 'ASC')
            ->get()
            ->getResultArray();

        $map = [];
        foreach ($rows as $row) {
            $name = ($row['user_name'] ?? '') !== '' ? (string) $row['user_name'] : (string) ($row['username'] ?? '');
            $map[(int) $row['messages_manager_id']][] = ['user_id' => (int) $row['user_manager_id'], 'name' => $name];
        }

        return $map;
    }

    /** Remove (soft) as marcacoes da mensagem cujo usuario NAO esta em $keepUserIds. */
    public function softDeleteExcept(int $messageId, array $keepUserIds): void
    {
        $builder = $this->db->table($this->table)->where('messages_manager_id', $messageId)->where('deleted_at', null);
        if ($keepUserIds !== []) {
            $builder->whereNotIn('user_manager_id', $keepUserIds);
        }
        $builder->update(['deleted_at' => date('Y-m-d H:i:s')]);
    }
}
