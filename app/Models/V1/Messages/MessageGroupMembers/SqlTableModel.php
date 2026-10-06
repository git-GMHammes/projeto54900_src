<?php

namespace App\Models\V1\Messages\MessageGroupMembers;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_group_members — vinculo N:N entre usuario e grupo de
 * mensagem (UNIQUE grupo+usuario). `role` owner/member; `status`
 * active/left/removed. O dono do grupo entra como `owner` na criacao do grupo e
 * nunca sai por esta tabela.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_group_members';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'message_groups_manager_id',
        'user_manager_id',
        'role',
        'status',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'message_groups_manager_id', 'user_manager_id', 'role', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [];

    /**
     * Ids dos vinculos que o usuario pode ver (inclui soft-deletados, para as rotas
     * get-deleted*): os dos grupos que ele criou e dos grupos em que e membro ativo.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->table($this->table)
            ->select('id')
            ->groupStart()
                ->where('message_groups_manager_id IN (SELECT id FROM message_groups_manager WHERE owner_user_manager_id = ' . $userId . ')', null, false)
                ->orWhere('message_groups_manager_id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = ' . $userId . " AND status = 'active' AND deleted_at IS NULL)", null, false)
            ->groupEnd()
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /** Vinculo (grupo, usuario), inclusive soft-deletado; null se nunca existiu. */
    public function findPair(int $groupId, int $userId): ?array
    {
        return $this->db->table($this->table)
            ->where('message_groups_manager_id', $groupId)
            ->where('user_manager_id', $userId)
            ->get()
            ->getRowArray();
    }

    /** Insere um vinculo ativo com papel member e devolve o id (0 se falhar). */
    public function insertMember(int $groupId, int $userId): int
    {
        $ok = $this->db->table($this->table)->insert([
            'message_groups_manager_id' => $groupId,
            'user_manager_id'           => $userId,
            'role'                      => 'member',
            'status'                    => 'active',
        ]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Reativa um vinculo existente (limpa deleted_at). */
    public function reactivate(int $id): void
    {
        $this->db->table($this->table)->where('id', $id)->update([
            'status'     => 'active',
            'deleted_at' => null,
        ]);
    }

    /** Marca o vinculo como removido. */
    public function markRemoved(int $id): void
    {
        $this->db->table($this->table)->where('id', $id)->update(['status' => 'removed']);
    }

    /** Dados do grupo (dono e status), sem soft-deletado; null se nao existe. */
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
        return $this->db->table($this->table)
            ->where('message_groups_manager_id', $groupId)
            ->where('user_manager_id', $userId)
            ->where('status', 'active')
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }

    /**
     * Status dos usuarios (id => status) entre os ids informados, sem soft-deletados.
     *
     * @param  list<int> $ids
     * @return array<int, string>
     */
    public function userStatuses(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $rows = $this->db->table('user_manager')->select('id, status')->whereIn('id', $ids)->where('deleted_at', null)->get()->getResultArray();
        $map  = [];
        foreach ($rows as $row) {
            $map[(int) $row['id']] = (string) $row['status'];
        }

        return $map;
    }
}
