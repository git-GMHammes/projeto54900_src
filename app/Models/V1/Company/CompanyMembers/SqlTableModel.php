<?php

namespace App\Models\V1\Company\CompanyMembers;

use App\Models\V1\BaseTableModel;

/**
 * Model da tabela company_members — vinculo N:N entre usuario e empresa
 * (UNIQUE empresa+usuario). `role` admin/member; `status` active/left/removed.
 */
class SqlTableModel extends BaseTableModel
{
    /** Isolamento por empresa: so os vinculos da empresa da sessao (company_id). */
    protected string $companyScope = 'column';

    protected $DBGroup        = DB_GROUP_001;
    protected $table          = 'company_members';
    protected $primaryKey     = 'id';
    protected $useSoftDeletes = true;
    protected $useTimestamps  = true;

    protected $hidden = [];

    protected $allowedFields = [
        'company_id',
        'user_manager_id',
        'role',
        'status',
    ];

    protected array $likeFields = [];

    protected array $sortableFields = [
        'id', 'company_id', 'user_manager_id', 'role', 'status',
        'created_at', 'updated_at',
    ];

    public array $searchFields = [];

    /**
     * Ids dos vinculos que o usuario pode ver (inclui soft-deletados, para as rotas
     * get-deleted*): os das empresas em que ele e membro ativo.
     *
     * @return list<int>
     */
    public function findVisibleIds(int $userId): array
    {
        $rows = $this->scopedTable()
            ->select('id')
            ->where('company_id IN (SELECT company_id FROM company_members WHERE user_manager_id = ' . $userId . " AND status = 'active' AND deleted_at IS NULL)", null, false)
            ->get()
            ->getResultArray();

        return array_map(static fn (array $row): int => (int) $row['id'], $rows);
    }

    /** Vinculo (empresa, usuario), inclusive soft-deletado; null se nunca existiu. */
    public function findPair(int $companyId, int $userId): ?array
    {
        return $this->scopedTable()
            ->where('company_id', $companyId)
            ->where('user_manager_id', $userId)
            ->get()
            ->getRowArray();
    }

    /** Insere um vinculo ativo com papel member e devolve o id (0 se falhar). */
    public function insertMember(int $companyId, int $userId): int
    {
        $ok = $this->db->table($this->table)->insert([
            'company_id'      => $companyId,
            'user_manager_id' => $userId,
            'role'            => 'member',
            'status'          => 'active',
        ]);

        return $ok ? (int) $this->db->insertID() : 0;
    }

    /** Reativa um vinculo existente (limpa deleted_at). */
    public function reactivate(int $id): void
    {
        $this->scopedTable()->where('id', $id)->update([
            'status'     => 'active',
            'deleted_at' => null,
        ]);
    }

    /** Marca o vinculo como removido. */
    public function markRemoved(int $id): void
    {
        $this->scopedTable()->where('id', $id)->update(['status' => 'removed']);
    }

    /** Dados da empresa (status), sem soft-deletada; null se nao existe. */
    public function findCompany(int $companyId): ?array
    {
        return $this->db->table('company_manager')
            ->select('id, status')
            ->where('id', $companyId)
            ->where('deleted_at', null)
            ->get()
            ->getRowArray();
    }

    /** O usuario e membro ativo (nao excluido) da empresa? */
    public function isActiveMember(int $companyId, int $userId): bool
    {
        return $this->scopedTable()
            ->where('company_id', $companyId)
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
