<?php

namespace App\Libraries\Company;

use Config\Database;

/**
 * Mantem consistentes as duas representacoes do vinculo usuario <-> empresa:
 *
 *  - company_members (fonte de verdade): um vinculo por usuario+empresa, com
 *    status active/left/removed;
 *  - user_manager.company_ids (JSON, ex.: [1,2]): copia derivada, lida no login
 *    e em /auth/me.
 *
 * Duas portas de escrita existem (a API de company-members e o campo company_ids
 * do user-manager); cada uma chama o metodo correspondente daqui para a outra
 * representacao nunca divergir.
 */
class CompanyMembership
{
    /**
     * company_members -> company_ids: recalcula o JSON do usuario a partir dos vinculos vigentes
     * (pending, active ou blocked) em empresas nao excluidas (sem nenhum = NULL). O ACESSO a empresa
     * so vale com vinculo 'active' (AuthService::userCanAccessCompany).
     */
    public static function syncUserCompanyIds(int $userId): void
    {
        $db = Database::connect(DB_GROUP_001);

        $rows = $db->table('company_members cm')
            ->select('cm.company_id')
            ->join('company_manager co', 'co.id = cm.company_id AND co.deleted_at IS NULL')
            ->where('cm.user_manager_id', $userId)
            ->whereIn('cm.status', ['pending', 'active', 'blocked'])
            ->where('cm.deleted_at', null)
            ->orderBy('cm.company_id', 'ASC')
            ->get()
            ->getResultArray();

        $ids = array_map(static fn (array $r): int => (int) $r['company_id'], $rows);

        $db->table('user_manager')->where('id', $userId)->update([
            'company_ids' => $ids === [] ? null : json_encode($ids),
        ]);
    }

    /**
     * company_ids -> company_members: leva os vinculos do usuario para a lista
     * informada. Ids da lista viram ativos (insere ou reativa); vinculos ativos
     * fora da lista ficam `removed`. Papel `admin` existente e preservado.
     *
     * @param list<int> $companyIds
     * @param list<int> $pendingIds  empresas em que o vinculo NOVO nasce 'pending' (aguardando aprovacao do
     *                              admin da empresa); as demais nascem 'active'. Vinculo ja existente nao e rebaixado.
     */
    public static function applyUserCompanyIds(int $userId, array $companyIds, array $pendingIds = []): void
    {
        $db = Database::connect(DB_GROUP_001);

        $validIds = [];
        if ($companyIds !== []) {
            $found = $db->table('company_manager')->select('id')->whereIn('id', $companyIds)->where('deleted_at', null)->get()->getResultArray();
            $validIds = array_map(static fn (array $r): int => (int) $r['id'], $found);
        }

        $existing = $db->table('company_members')->where('user_manager_id', $userId)->get()->getResultArray();
        $byCompany = [];
        foreach ($existing as $row) {
            $byCompany[(int) $row['company_id']] = $row;
        }

        $db->transStart();

        foreach ($validIds as $companyId) {
            $row = $byCompany[$companyId] ?? null;

            if ($row === null) {
                $db->table('company_members')->insert([
                    'company_id'      => $companyId,
                    'user_manager_id' => $userId,
                    'role'            => 'member',
                    'status'          => in_array($companyId, $pendingIds, true) ? 'pending' : 'active',
                ]);
            } elseif (in_array($row['status'], ['left', 'removed'], true) || $row['deleted_at'] !== null) {
                $db->table('company_members')->where('id', $row['id'])->update([
                    'status'     => in_array($companyId, $pendingIds, true) ? 'pending' : 'active',
                    'deleted_at' => null,
                ]);
            }
        }

        foreach ($byCompany as $companyId => $row) {
            if (!in_array($companyId, $validIds, true) && in_array($row['status'], ['pending', 'active', 'blocked'], true) && $row['deleted_at'] === null) {
                $db->table('company_members')->where('id', $row['id'])->update(['status' => 'removed']);
            }
        }

        $db->transComplete();
    }
}
