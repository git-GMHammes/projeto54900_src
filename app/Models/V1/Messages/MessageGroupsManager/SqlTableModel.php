<?php

namespace App\Models\V1\Messages\MessageGroupsManager;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela message_groups_manager — o grupo do modulo Message (NAO e sala
 * de chat: mensagem de grupo e uma linha de messages_manager ligada ao grupo por
 * message_group_messages).
 *
 * Dono em owner_user_manager_id (imutavel); status alterna active/inactive pelo
 * dono. Os usuarios do grupo ficam em message_group_members.
 */
class SqlTableModel extends BaseTableModel
{
    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'message_groups_manager';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'owner_user_manager_id',
        'name',
        'description',
        'status',
    ];

    protected array $likeFields = ['name', 'description'];

    protected array $sortableFields = [
        'id', 'owner_user_manager_id', 'name', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = ['name', 'description'];

    /**
     * Ids dos grupos que o usuario pode ver (inclui soft-deletados, para as
     * rotas get-deleted*): os que ele criou e aqueles em que e membro ativo.
     * Admin nao usa este metodo.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->db->table($this->table)
            ->select('id')
            ->groupStart()
                ->where('owner_user_manager_id', $userId)
                ->orWhere('id IN (SELECT message_groups_manager_id FROM message_group_members WHERE user_manager_id = ' . $userId . " AND status = 'active' AND deleted_at IS NULL)", null, false)
            ->groupEnd()
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
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

    /** Insere o dono como membro (role=owner) do grupo recem-criado. */
    public function addOwnerMember(int $groupId, int $userId): bool
    {
        return (bool) $this->db->table('message_group_members')->insert([
            'message_groups_manager_id' => $groupId,
            'user_manager_id'           => $userId,
            'role'                      => 'owner',
            'status'                    => 'active',
        ]);
    }
}
